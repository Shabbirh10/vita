from django.db import models


class Resume(models.Model):
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Basic Contact Info
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)

    # Parsed Content
    skills = models.JSONField(default=dict, blank=True)        # {category: [skills]}
    education = models.JSONField(default=list, blank=True)     # [lines]
    experience = models.JSONField(default=list, blank=True)    # [lines]
    projects = models.JSONField(default=list, blank=True)      # [lines]

    # ATS Score
    ats_score = models.IntegerField(default=0)
    ats_breakdown = models.JSONField(default=dict, blank=True)

    # Raw text
    extracted_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Resume {self.id} - {self.name or 'Unknown'}"
