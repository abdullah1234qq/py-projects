from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path

from backend.config import LANGUAGES, language_code
from backend.services.pdf import create_pdf_from_text, extract_pdf_text
from backend.services.speech import SpeechService, clean_text
from backend.services.translation import translate
from backend.services.tts import synthesize_all_languages, synthesize_speech

speech_service = SpeechService(model_name="tiny")


def _run(coro):
    return asyncio.run(coro)


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
    try:
        if file is None:
            return None, None, None
        result = _run(speech_service.transcribe_file(Path(file)))
        text = clean_text(result.text)
        translated = translate(text, LANGUAGES[language])
        pdf_file = Path(tempfile.gettempdir()) / f"{filename or 'voice2pdf'}.pdf"
        _run(create_pdf_from_text(translated, pdf_file, title="Voice2PDF Transcript"))
        return text, translated, str(pdf_file)
    except Exception:
        return None, None, None


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
            original = gr.Textbox(label="Original")
            translated = gr.Textbox(label="Translated")
            pdf = gr.File(label="PDF")
            gr.Button("Convert").click(audio_to_pdf, [audio, language, filename], [original, translated, pdf])
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
