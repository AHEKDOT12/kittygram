from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from cats.models import Achievement, Cat

from .serializers import AchievementSerializer, CatSerializer


class CatViewSet(viewsets.ModelViewSet):
    serializer_class = CatSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return (
            Cat.objects.filter(owner=self.request.user)
            .select_related("owner")
            .prefetch_related("achievements")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = (IsAuthenticated,)
