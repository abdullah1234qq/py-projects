from __future__ import annotations

import asyncio
import shutil
import subprocess
import tempfile
import uuid
import wave
from pathlib import Path

from backend.jobs import get_job, start_audio_to_pdf_job

speech_service = SpeechService(model_name="tiny")
TARGET_SAMPLE_RATE = 16_000
TARGET_CHANNELS = 1
CHUNK_LENGTH_SECONDS = 90


def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return asyncio.create_task(coro)
        else:
            return asyncio.run(coro)
    except:
        return asyncio.run(coro)


def _run(coro):
    return run_async(coro)


def _remove_empty_parent(path: Path) -> None:
    parent = path.parent
    try:
        parent.rmdir()
    except OSError:
        pass


def _duration_seconds(file_path: Path) -> float:
    with wave.open(str(file_path), "rb") as wav_file:
        frames = wav_file.getnframes()
        frame_rate = wav_file.getframerate()
        if frame_rate <= 0:
            return 0.0
        return frames / float(frame_rate)


def convert_to_wav(file_path):
    source = Path(file_path)
    if not source.exists():
        raise FileNotFoundError(f"Audio file not found: {source}")

    output_dir = Path(tempfile.mkdtemp(prefix="voice2pdf-wav-"))
    wav_path = output_dir / f"{source.stem or 'audio'}-{uuid.uuid4().hex}.wav"

    try:
        import ffmpeg

        audio_stream = ffmpeg.input(str(source)).audio
        (
            ffmpeg.output(
                audio_stream,
                str(wav_path),
                format="wav",
                acodec="pcm_s16le",
                ac=TARGET_CHANNELS,
                ar=TARGET_SAMPLE_RATE,
            )
            .overwrite_output()
            .run(quiet=True)
        )
    except ImportError:
        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-y",
                    "-i",
                    str(source),
                    "-vn",
                    "-acodec",
                    "pcm_s16le",
                    "-ac",
                    str(TARGET_CHANNELS),
                    "-ar",
                    str(TARGET_SAMPLE_RATE),
                    str(wav_path),
                ],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
        except Exception:
            shutil.rmtree(output_dir, ignore_errors=True)
            raise
    except Exception:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise

    if not wav_path.exists() or wav_path.stat().st_size == 0:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise RuntimeError("Audio conversion failed.")
    return str(wav_path)


def split_audio(file_path):
    from pydub import AudioSegment

    source = Path(file_path)
    duration = _duration_seconds(source)
    if duration <= 0:
        raise RuntimeError("Audio file has no readable duration.")

    chunk_dir = Path(tempfile.mkdtemp(prefix="voice2pdf-chunks-"))
    chunks = []
    start_second = 0.0
    index = 0

    try:
        while start_second < duration:
            chunk_duration = min(CHUNK_LENGTH_SECONDS, duration - start_second)
            chunk_audio = AudioSegment.from_file(
                str(source),
                format="wav",
                start_second=start_second,
                duration=chunk_duration,
            )
            chunk_audio = chunk_audio.set_channels(TARGET_CHANNELS).set_frame_rate(TARGET_SAMPLE_RATE)
            chunk_path = chunk_dir / f"chunk-{index:04d}.wav"
            chunk_audio.export(str(chunk_path), format="wav", parameters=["-acodec", "pcm_s16le"])
            chunks.append(str(chunk_path))
            start_second += CHUNK_LENGTH_SECONDS
            index += 1
    except Exception:
        cleanup_chunks(chunks)
        shutil.rmtree(chunk_dir, ignore_errors=True)
        raise

    return chunks


def transcribe_chunks(chunks):
    transcript_parts = []
    for chunk in chunks:
        try:
            result = _run(speech_service.transcribe_file(Path(chunk)))
            text = clean_text(result.text or "").strip()
            if text:
                transcript_parts.append(text)
        except Exception:
            continue
    return clean_text(" ".join(transcript_parts)).strip()


def cleanup_chunks(chunks):
    parents = set()
    for chunk in chunks:
        chunk_path = Path(chunk)
        parents.add(chunk_path.parent)
        try:
            chunk_path.unlink(missing_ok=True)
        except OSError:
            pass

    for parent in parents:
        try:
            shutil.rmtree(parent)
        except OSError:
            pass


def read_pdf(file_path):
    try:
        return _run(extract_pdf_text(Path(file_path)))
    except Exception:
        return ""


def text_to_audio(text, lang):
    if not text.strip():
        return None
    try:
        return str(_run(synthesize_speech(text, lang)))
    except Exception:
        return None


def text_to_all_audio(text):
    if not text.strip():
        return None
    try:
        return str(_run(synthesize_all_languages(text)))
    except Exception:
        return None


def audio_to_pdf(file, language, filename):
    """Start background audio to PDF conversion and return job ID."""
    if file is None:
        return None, "No file provided"

    try:
        # Save uploaded file temporarily
        import tempfile
        import shutil
        from pathlib import Path

        temp_dir = Path(tempfile.mkdtemp())
        temp_file = temp_dir / f"upload_{uuid.uuid4().hex}"
        shutil.copy(file, temp_file)

        # Start background job
        job_id = start_audio_to_pdf_job(temp_file, language, filename or "voice2pdf")

        return job_id, "Processing started. Use the job ID to check status."

    except Exception as e:
        return None, f"Failed to start processing: {str(e)}"


def get_job_status(job_id):
    """Get the status of a background job."""
    if not job_id:
        return "No job ID provided", 0, None

    try:
        job = get_job(job_id)
        if not job:
            return "Job not found", 0, None

        status = job["status"]
        progress = job["progress"]

        if status == "completed" and job["result"]:
            return "Completed", 100, job["result"]
        elif status == "failed":
            return f"Failed: {job['error']}", 0, None
        else:
            return f"Processing... {progress}%", progress, None

    except Exception as e:
        return f"Error checking status: {str(e)}", 0, None


def pdf_to_audio(file, language):
    if file is None:
        return None, None
    text = read_pdf(file)
    if not text.strip():
        return None, None
    translated = translate(text, LANGUAGES[language])
    audio = text_to_audio(translated, LANGUAGES[language])
    return audio, audio


def pdf_to_all_audio(file):
    if file is None:
        return None
    text = read_pdf(file)
    if not text.strip():
        return None
    return text_to_all_audio(text)


def realtime(audio, language):
    if audio is None:
        return None, None, None
    lang_code = language_code(language)
    result = _run(speech_service.transcribe_file(Path(audio), language=None))
    text = clean_text(result.text)
    translated = translate(text, lang_code)
    audio_file = text_to_audio(translated, "en")
    return text, translated, audio_file


def create_demo():
    import gradio as gr

    with gr.Blocks(title="Voice2PDF") as demo:
        gr.Markdown("# Voice2PDF")
        with gr.Tab("Audio to PDF"):
            audio = gr.Audio(type="filepath", label="Audio")
            language = gr.Dropdown(list(LANGUAGES), value="English", label="Language")
            filename = gr.Textbox(value="voice2pdf", label="PDF filename")
            job_id_output = gr.Textbox(label="Job ID", interactive=False)
            status_output = gr.Textbox(label="Status", interactive=False)
            progress_bar = gr.Slider(minimum=0, maximum=100, value=0, label="Progress", interactive=False)
            pdf = gr.File(label="PDF", visible=False)

            start_btn = gr.Button("Start Conversion")
            start_btn.click(
                audio_to_pdf,
                [audio, language, filename],
                [job_id_output, status_output]
            ).then(
                lambda job_id: gr.update(visible=True) if job_id else gr.update(visible=False),
                job_id_output,
                progress_bar
            )

            # Poll for status every 2 seconds
            def poll_status(job_id):
                if not job_id:
                    return "Waiting for job to start...", 0, gr.update(visible=False)
                status, progress, pdf_path = get_job_status(job_id)
                if pdf_path:
                    return status, progress, gr.update(visible=True, value=pdf_path)
                return status, progress, gr.update(visible=False)

            job_id_output.change(
                poll_status,
                job_id_output,
                [status_output, progress_bar, pdf],
                every=2
            )
        with gr.Tab("PDF to Audio"):
            pdf_input = gr.File(label="PDF", file_types=[".pdf"])
            pdf_language = gr.Dropdown(list(LANGUAGES), value="English", label="Language")
            audio_output = gr.Audio(label="Audio")
            audio_file = gr.File(label="Download")
            gr.Button("Generate Audio").click(pdf_to_audio, [pdf_input, pdf_language], [audio_output, audio_file])
        with gr.Tab("PDF to All Audio"):
            all_pdf = gr.File(label="PDF", file_types=[".pdf"])
            zip_output = gr.File(label="All languages ZIP")
            gr.Button("Generate ZIP").click(pdf_to_all_audio, all_pdf, zip_output)
        with gr.Tab("Realtime"):
            live_audio = gr.Audio(type="filepath", label="Audio")
            live_language = gr.Dropdown(list(LANGUAGES), value="English", label="Language")
            live_original = gr.Textbox(label="Original")
            live_translated = gr.Textbox(label="Translated")
            live_audio_out = gr.Audio(label="Audio")
            gr.Button("Transcribe").click(
                realtime,
                [live_audio, live_language],
                [live_original, live_translated, live_audio_out],
            )
    return demo
