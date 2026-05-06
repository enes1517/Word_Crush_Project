import sys

def read_pdf():
    try:
        import PyPDF2
    except ImportError:
        print("Lütfen önce kütüphaneyi kurun: pip install PyPDF2")
        return

    try:
        with open('Yazlab 2- Proje 2.pdf', 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text() + '\n'
            
            with open('pdf_icerik.txt', 'w', encoding='utf-8') as out:
                out.write(text)
        print("BAŞARILI: pdf_icerik.txt dosyası oluşturuldu! Şimdi chat'e 'Devam et' yazabilirsiniz.")
    except Exception as e:
        print(f"HATA: {e}")

if __name__ == "__main__":
    read_pdf()
