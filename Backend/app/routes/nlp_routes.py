from fastapi import APIRouter, HTTPException
from models.requirements_model import RequirementsInput, RequirementsAnalysisOutput
from controllers.NLP_Processor import NLPProcessor

router = APIRouter(prefix="/api/nlp", tags=["NLP Analysis"])

nlp_processor = NLPProcessor()

@router.post("/analyze-requirements", response_model=RequirementsAnalysisOutput)
async def analyze_requirements(input_data: RequirementsInput):
    """
    Analyze user requirements and extract structured information
    """
    try:
        result = nlp_processor.analyze_requirements(
            requirements_text=input_data.requirements_text,
            context=input_data.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/health")
async def nlp_health():
    """Health check for NLP service"""
    return {"status": "healthy", "service": "NLP Processor"}