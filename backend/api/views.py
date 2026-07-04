from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
from .services.parser import extract_data

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all().order_by('-uploaded_at')
    serializer_class = ResumeSerializer

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Received request.data: {request.data}")
        print(f"DEBUG: Received request.FILES: {request.FILES}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        instance = serializer.instance

        job_description = request.data.get('job_description')

        try:
            self.process_resume(instance, job_description=job_description)
        except RuntimeError as e:
            instance.delete()
            return Response({"error": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        instance.refresh_from_db()
        return Response(ResumeSerializer(instance).data, status=status.HTTP_201_CREATED)

    def process_resume(self, instance, job_description=None):
        data = extract_data(instance.file.path, job_description=job_description)
        instance.name = data.get('name')
        instance.email = data.get('email')
        instance.phone = data.get('phone')
        instance.linkedin = data.get('linkedin')
        instance.github = data.get('github')
        instance.skills = data.get('skills')
        instance.education = data.get('education')
        instance.experience = data.get('experience')
        instance.projects = data.get('projects')
        instance.ats_score = data.get('ats_score', 0)
        instance.ats_breakdown = data.get('ats_breakdown', {})
        instance.extracted_text = data.get('extracted_text')
        instance.save()

