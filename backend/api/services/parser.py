import io
import json
import os
import re
from pathlib import Path

from google import genai
import pdfplumber
import spacy
from dotenv import load_dotenv

load_dotenv()

genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Load Spacy Model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import en_core_web_sm
    nlp = en_core_web_sm.load()

# ─── Expanded Skills Database ───────────────────────────────────────────────
SKILLS_DB = {
    "Languages": [
        "Python", "Java", "C++", "C", "C#", "JavaScript", "TypeScript",
        "Go", "Rust", "Kotlin", "Swift", "Ruby", "PHP", "Scala", "R",
        "MATLAB", "Bash", "Shell", "Perl", "Dart", "Lua", "Haskell",
    ],
    "Frontend": [
        "React", "Next.js", "Vue.js", "Angular", "Svelte", "HTML", "CSS",
        "Tailwind CSS", "Bootstrap", "SASS", "Redux", "Zustand", "GraphQL",
        "React Native", "Flutter", "Electron", "jQuery", "Three.js",
    ],
    "Backend": [
        "Node.js", "Django", "FastAPI", "Flask", "Spring Boot", "Express.js",
        "NestJS", "Laravel", "Ruby on Rails", "ASP.NET", "Gin", "Fiber",
        "REST API", "gRPC", "WebSockets", "Microservices",
    ],
    "Data & AI": [
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "Pandas",
        "NumPy", "Matplotlib", "Seaborn", "Plotly", "OpenCV", "Spacy",
        "NLTK", "Hugging Face", "LangChain", "LLM", "RAG", "BERT",
        "Transformers", "XGBoost", "LightGBM", "Statsmodels",
    ],
    "Databases": [
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
        "SQLite", "Firebase", "DynamoDB", "Cassandra", "Neo4j", "Supabase",
        "Prisma", "SQLAlchemy", "Mongoose",
    ],
    "DevOps & Cloud": [
        "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
        "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Ansible",
        "Linux", "Nginx", "Apache", "Prometheus", "Grafana", "Helm",
    ],
    "Tools": [
        "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
        "Figma", "Postman", "VSCode", "IntelliJ", "Jupyter", "Notion",
        "Slack", "Agile", "Scrum", "Kanban", "TDD", "BDD",
    ],
}

# Flat list for quick lookup
ALL_SKILLS = [s for category in SKILLS_DB.values() for s in category]

# ─── Education Keywords ─────────────────────────────────────────────────────
EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "m.e",
    "b.sc", "m.sc", "mba", "bca", "mca", "b.com", "m.com",
    "university", "college", "institute", "school",
    "graduation", "post-graduation", "diploma", "degree",
]

EDUCATION_SECTION_HEADERS = [
    "education", "academic background", "qualifications",
    "educational qualifications", "academic qualifications",
]

EXPERIENCE_SECTION_HEADERS = [
    "experience", "work experience", "professional experience",
    "employment history", "internship", "internships",
    "work history", "career history",
]

PROJECT_SECTION_HEADERS = [
    "projects", "project", "key projects", "personal projects",
    "academic projects", "professional projects",
]


# ─── Extractors ─────────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def extract_email(text):
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text):
    pattern = r'(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}'
    match = re.search(pattern, text)
    return match.group(0).strip() if match else None


def extract_linkedin(text):
    pattern = r'linkedin\.com/in/[\w\-]+'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return "https://" + match.group(0)
    return None


def extract_github(text):
    pattern = r'github\.com/[\w\-]+'
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return "https://" + match.group(0)
    return None


def extract_name(doc, raw_text):
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()][:5]
    exclude_list = [
        "Java", "Python", "JavaScript", "Resume", "Curriculum Vitae",
        "Email", "Phone", "LinkedIn", "GitHub", "Portfolio",
    ]
    for line in lines:
        line_doc = nlp(line)
        for ent in line_doc.ents:
            if ent.label_ == "PERSON" and ent.text not in exclude_list:
                if len(ent.text.split()) >= 2:
                    return ent.text
    for ent in doc.ents:
        if ent.label_ == "PERSON" and ent.text not in exclude_list:
            if len(ent.text.split()) >= 2:
                return ent.text
    return lines[0] if lines else None


def extract_skills(text):
    found = {}
    text_lower = text.lower()
    for category, skills in SKILLS_DB.items():
        matched = []
        for skill in skills:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
                matched.append(skill)
        if matched:
            found[category] = matched
    return found


def extract_section_text(text, headers):
    """Extract lines belonging to a section by detecting its header."""
    lines = text.split('\n')
    in_section = False
    section_lines = []
    stop_headers = [
        "education", "experience", "projects", "skills", "certifications",
        "awards", "publications", "languages", "interests", "references",
        "hobbies", "summary", "objective", "profile", "leadership",
        "volunteering", "publications", "patents", "honors",
    ]
    for line in lines:
        stripped = line.strip().lower()
        if any(h in stripped for h in headers):
            in_section = True
            continue
        if in_section:
            if stripped and any(h in stripped for h in stop_headers + headers):
                if not any(h in stripped for h in headers):
                    break
            section_lines.append(line)
    return '\n'.join(section_lines).strip()


def _is_bullet(line):
    return bool(re.match(r'^[\s]*[•\-*→·#▸▹►▪–—\d]+[\.\)\s]', line))


def _is_subtitle(line, prev_is_title):
    if not prev_is_title:
        return False
    cleaned = line.strip().lstrip('•\-*→·#▸▹►▪–—').strip()
    if not cleaned:
        return False
    has_date = bool(re.search(r'\b(19|20)\d{2}\b', cleaned))
    has_separator = '|' in cleaned or ' – ' in cleaned or ' — ' in cleaned
    is_edu = any(kw in cleaned.lower() for kw in [
        'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e',
        'b.sc', 'm.sc', 'mba', 'bca', 'mca', 'b.com', 'm.com',
        'b.s.', 'm.s.', 'ph.d', 'bachelors', 'masters',
    ])
    short = len(cleaned) < 80
    return short and (has_date or has_separator or is_edu)


def _is_title_line(line, prev_was_bullet):
    if not line:
        return False
    stripped = line.strip()
    if not stripped:
        return False
    if _is_bullet(stripped):
        return False
    if len(stripped) > 100:
        return False
    if stripped[0].islower():
        edu_kw = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e']
        if not any(kw in stripped.lower() for kw in edu_kw):
            return False
    return True


def parse_entries(section_text):
    if not section_text:
        return []
    raw = [l.strip() for l in section_text.strip().split('\n') if l.strip()]
    if not raw:
        return []

    entries = []
    current_title = None
    current_points = []
    just_set_title = False

    for line in raw:
        is_bullet = _is_bullet(line)
        is_sub = _is_subtitle(line, just_set_title)
        could_be_title = not is_bullet and not is_sub
        is_title = could_be_title and not just_set_title

        if is_title:
            if current_title:
                entries.append({
                    'title': current_title,
                    'points': current_points,
                })
            current_title = line
            current_points = []
            just_set_title = True
        elif is_sub:
            current_title = (current_title or '') + ' — ' + line.lstrip('•\-*→·#▸▹►▪–—').strip()
            just_set_title = False
        else:
            cleaned = line.lstrip('•\-*→·#▸▹►▪–—▹').strip()
            if cleaned:
                current_points.append(cleaned)
            just_set_title = False

    if current_title:
        entries.append({
            'title': current_title,
            'points': current_points,
        })

    return entries


def extract_education(text):
    section = extract_section_text(text, EDUCATION_SECTION_HEADERS)
    if section:
        entries = parse_entries(section)
        if entries:
            return entries[:5]
    lines = text.split('\n')
    edu_lines = []
    for line in lines:
        if any(kw in line.lower() for kw in EDUCATION_KEYWORDS):
            edu_lines.append(line.strip())
    return [{'title': l, 'points': []} for l in edu_lines[:5]]


def extract_experience(text):
    section = extract_section_text(text, EXPERIENCE_SECTION_HEADERS)
    if not section:
        return []
    return parse_entries(section)[:10]


def extract_projects(text):
    section = extract_section_text(text, PROJECT_SECTION_HEADERS)
    if not section:
        return []
    return parse_entries(section)[:10]


def compute_ats_score(skills_dict, name, email, phone, education, experience):
    breakdown = {}
    total = 0

    contact = 0
    if name:
        contact += 8
    if email:
        contact += 9
    if phone:
        contact += 8
    breakdown["Contact Info"] = contact
    total += contact

    # Handle dictionary vs list of skills
    if isinstance(skills_dict, dict):
        all_found = []
        for cat in skills_dict.values():
            if isinstance(cat, list):
                all_found.extend(cat)
            elif isinstance(cat, str):
                all_found.append(cat)
    elif isinstance(skills_dict, list):
        all_found = skills_dict
    else:
        all_found = []

    skill_score = min(40, len(all_found) * 3)
    breakdown["Skills"] = skill_score
    total += skill_score

    exp_score = min(20, len(experience) * 4) if experience else 0
    breakdown["Experience"] = exp_score
    total += exp_score

    edu_score = min(15, len(education) * 5) if education else 0
    breakdown["Education"] = edu_score
    total += edu_score

    return min(total, 100), breakdown


def compute_ats_score_with_jd(resume_data, job_description):
    """Use Gemini to calculate a customized ATS score and breakdown matching the job description."""
    if not os.getenv("GEMINI_API_KEY") or not job_description.strip():
        return None, None
        
    system_prompt = """You are an ATS (Applicant Tracking System) recruiter match analyzer.
Compare the Candidate's structured Resume JSON against the Job Description.
Return ONLY valid JSON with this schema:
{
  "ats_score": 85, // integer between 0 and 100 representing compatibility match
  "ats_breakdown": {
    "Contact Info": 25, // Contact info rating (up to 25)
    "Skills": 35, // Skill alignment rating (up to 40)
    "Experience": 15, // Relevant experience rating (up to 20)
    "Education": 10 // Relevant education rating (up to 15)
  }
}
All ratings must sum up to the total ats_score."""

    try:
        candidate_json = json.dumps(resume_data, indent=2)
        response = genai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{system_prompt}\n\nCANDIDATE RESUME JSON:\n{candidate_json}\n\nJOB DESCRIPTION:\n{job_description[:6000]}",
            config={"temperature": 0.1},
        )
        content = response.text.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[-1]
            content = content.rsplit("```", 1)[0].strip()
        result = json.loads(content)
        
        ats_score = int(result.get("ats_score", 0))
        ats_breakdown = result.get("ats_breakdown", {})
        return min(max(ats_score, 0), 100), ats_breakdown
    except Exception as e:
        print(f"Error computing ATS score with JD: {e}")
        return None, None


# ─── AI Parser ──────────────────────────────────────────────────────────────

AI_SCHEMA = """{
  "name": "Full Name or null",
  "skills": {
    "Languages": ["skill1", "skill2"],
    "Frontend": [],
    "Backend": [],
    "Data & AI": [],
    "Databases": [],
    "DevOps & Cloud": [],
    "Tools": []
  },
  "education": [{"title": "Institution Name — Degree", "points": ["detail1", "detail2"]}],
  "experience": [{"title": "Job Title — Company | Dates", "points": ["responsibility1"]}],
  "projects": [{"title": "Project Name", "points": ["detail1"]}]
}"""

AI_SYSTEM_PROMPT = """You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON matching this schema:

{AI_SCHEMA}

RULES:
- Each education entry = one institution. Points: degree, GPA, dates, achievements.
- Each experience entry = one role. Points: responsibilities, technologies, outcomes.
- Each project entry = one project. Points: tech used, results.
- Categorize every skill into its correct group.
- Use null for missing name, empty arrays for missing sections.
- Do not add any markdown formatting, code fences, or text before/after the JSON."""


def extract_data_ai(text):
    """Use Gemini to extract structured data from resume text."""
    if not os.getenv("GEMINI_API_KEY"):
        return None

    try:
        response = genai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{AI_SYSTEM_PROMPT}\n\nRESUME TEXT:\n{text[:8000]}",
            config={"temperature": 0.1},
        )
        content = response.text.strip()
        # Strip any markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[-1]
            content = content.rsplit("```", 1)[0].strip()
        result = json.loads(content)

        # Validate and normalize
        for section in ["education", "experience", "projects"]:
            if section in result and isinstance(result[section], list):
                result[section] = [
                    {"title": e.get("title", ""), "points": e.get("points", [])}
                    for e in result[section]
                ]
            else:
                result[section] = []

        if "skills" not in result or not isinstance(result["skills"], dict):
            result["skills"] = {}

        return result

    except Exception as e:
        print(f"AI parser error: {e}")
        return None


# ─── Main Entry Point ───────────────────────────────────────────────────────

def extract_data(file_path, job_description=None):
    text = extract_text_from_pdf(file_path)

    ai_result = extract_data_ai(text)
    if not ai_result:
        raise RuntimeError(
            "Gemini API quota exhausted or no API key configured. "
            "Get a free key at https://aistudio.google.com/apikey"
        )

    name = ai_result.get("name") or extract_name(nlp(text[:100_000]), text)
    email = extract_email(text) or ai_result.get("email")
    phone = extract_phone(text) or ai_result.get("phone")
    linkedin = extract_linkedin(text) or ai_result.get("linkedin")
    github = extract_github(text) or ai_result.get("github")
    skills = ai_result.get("skills", {})
    education = ai_result.get("education", [])
    experience = ai_result.get("experience", [])
    projects = ai_result.get("projects", [])

    ats_score = None
    ats_breakdown = None

    if job_description and job_description.strip():
        resume_data = {
            "name": name,
            "skills": skills,
            "education": education,
            "experience": experience,
            "projects": projects
        }
        ats_score, ats_breakdown = compute_ats_score_with_jd(resume_data, job_description)

    if ats_score is None or ats_breakdown is None:
        ats_score, ats_breakdown = compute_ats_score(
            skills_dict=skills,
            name=name,
            email=email,
            phone=phone,
            education=education,
            experience=experience,
        )

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "ats_score": ats_score,
        "ats_breakdown": ats_breakdown,
        "extracted_text": text,
    }
