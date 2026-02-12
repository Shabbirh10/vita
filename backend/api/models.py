from django.db import models

class Resume(models.Model):
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Extracted Data
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    extracted_text = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Resume {self.id} - {self.name or 'Unknown'}"
