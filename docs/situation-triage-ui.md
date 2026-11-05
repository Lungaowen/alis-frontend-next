# Situation triage UI

The Guided workflows page provides four intake paths: general situation, employment/CCMA preparation, lease/landlord notices, and potential personal-information incidents.

The Scanner requires an existing ALIS bearer token in `alis_token`. It creates a matter through the Java core, queues the analysis through the authenticated matter route, then polls the Java status proxy while the Python Celery task runs. The browser never receives the internal Python service token.

The result view calls out the AI preparation boundary, renders the timeline and supported source quotations, and makes identified gaps actionable. Gap checkmarks are currently session-only and must not be described as persisted case evidence or as legal resolution.

Configuration: set `NEXT_PUBLIC_JAVA_API_URL` to the Java API. Do not expose `ALIS_AI_SERVICE_TOKEN` or an internal Python URL in a public environment variable.
