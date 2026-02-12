from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
from .services.parser import extract_data

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all().order_by('-uploaded_at')
    serializer_class = ResumeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Trigger parsing synchronously for now (simpler demo)
        instance = serializer.instance
        self.process_resume(instance)
        
        # Refresh from DB to include updated fields
        instance.refresh_from_db()
        return Response(ResumeSerializer(instance).data, status=status.HTTP_201_CREATED)

    def process_resume(self, instance):
        try:
            data = extract_data(instance.file.path)
            instance.name = data.get('name')
            instance.email = data.get('email')
            instance.skills = data.get('skills')
            instance.extracted_text = data.get('extracted_text')
            instance.save()
        except Exception as e:
            print(f"Error parsing resume {instance.id}: {e}")

