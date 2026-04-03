from django.conf import settings
from openai import OpenAI
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_chat_view(request):
    user_message = (request.data.get("message") or "").strip()
    if not user_message:
        return Response({"error": "message is required"}, status=400)

    if not getattr(settings, "OPENAI_API_KEY", None):
        return Response({"error": "OpenAI is not configured"}, status=503)

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": user_message}],
        )
        reply = (response.choices[0].message.content or "").strip()
        return Response({"reply": reply})
    except Exception as e:
        return Response({"error": str(e)}, status=502)
