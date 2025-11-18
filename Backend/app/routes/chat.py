from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from app.controllers.NLP_Processor import NLPProcessor
from app.controllers import RAG
# from app.controllers import Reasoning_engine

router = APIRouter(prefix="/chat", tags=["chat"])

# instantiate heavy components once
_nlp_processor = NLPProcessor()

class AskRequest(BaseModel):
    query: str
    context: str | None = None

def _serialize(obj: Any):
    """Recursive serializer for RequirementsAnalysisOutput and nested objects."""
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    # dataclass / simple objects
    try:
        data = {}
        for k, v in vars(obj).items():
            data[k] = _serialize(v)
        return data
    except Exception:
        return str(obj)

@router.post("/ask")
async def ask(payload: AskRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    # 1) NLP analysis
    try:
        nlp_output = _nlp_processor.analyze_requirements(payload.query, context=payload.context)
        nlp_json = _serialize(nlp_output)
        # ensure raw_input and summary exist
        nlp_json.setdefault("raw_input", payload.query)
        nlp_json.setdefault("summary", nlp_json.get("summary") or payload.query[:200])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP processing failed: {e}")

    # 2) RAG / Architecture recommendation
    try:
        recommendation = RAG.get_architecture_recommendation(nlp_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Architecture recommendation failed: {e}")

    # # 3) Reasoning/validation (use your implemented functions in Reasoning_engine)
    # try:
    #     validation = Reasoning_engine.validate_architecture(nlp_json, recommendation)
    # except Exception as e:
    #     # don't fail the whole request for validation errors; return partial info
    #     validation = {"valid": False, "errors": [f"Validation failed: {e}"]}

    return {
        "nlp": nlp_json,
        "recommendation": recommendation
    }