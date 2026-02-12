import spacy
import pdfplumber
import re
from pathlib import Path

# Load Spacy Model (Ensure 'en_core_web_sm' is downloaded)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback or auto-download script could be here
    # For now, assume it's installed via requirements/script
    import en_core_web_sm
    nlp = en_core_web_sm.load()

# Skill Database (Simplified for Demo)
SKILLS_DB = [
    "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Next.js",
    "Node.js", "Django", "FastAPI", "Flask", "SQL", "PostgreSQL", "MongoDB",
    "AWS", "Docker", "Kubernetes", "Git", "Machine Learning", "Deep Learning",
    "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "NLP", "Spacy"
]

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extract = page.extract_text()
            if extract:
                text += extract + "\n"
    return text

def extract_email(text):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_name(doc, raw_text):
    # Heuristic 1: The name is usually in the first few lines
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()][:5]
    
    # Filter for technical terms misidentified as names
    exclude_list = ["Java", "Python", "JavaScript", "Resume", "Curriculum Vitae", "Email", "Phone"]
    
    # Check lines for PERSON entities
    for line in lines:
        line_doc = nlp(line)
        for ent in line_doc.ents:
            if ent.label_ == "PERSON" and ent.text not in exclude_list:
                # Basic check: Name usually has 2+ words
                if len(ent.text.split()) >= 2:
                    return ent.text
                    
    # Fallback to first PERSON in the main doc (still filtering excluded)
    for ent in doc.ents:
        if ent.label_ == "PERSON" and ent.text not in exclude_list:
            if len(ent.text.split()) >= 2:
                return ent.text
                
    return lines[0] if lines else "Not Found"


def extract_skills(text):
    # Simple keyword matching + minor NLP normalization
    found_skills = []
    text_lower = text.lower()
    for skill in SKILLS_DB:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return list(set(found_skills))

def extract_data(file_path):
    """
    Main entry point for parsing.
    Returns: dict with name, email, skills, extracted_text
    """
    text = extract_text_from_pdf(file_path)
    doc = nlp(text)
    
    return {
        "name": extract_name(doc, text),
        "email": extract_email(text),
        "skills": extract_skills(text),
        "extracted_text": text
    }
