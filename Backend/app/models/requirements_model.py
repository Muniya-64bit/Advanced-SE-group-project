from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FunctionalRequirement(BaseModel):
    id: str
    text: str
    priority: Optional[str] = "medium"
    category: Optional[str] = None

class NonFunctionalRequirement(BaseModel):
    id: str
    text: str
    category: str  # scalability, performance, security, availability, etc.
    value: Optional[str] = None
    unit: Optional[str] = None
    priority: Optional[str] = "medium"

class Constraint(BaseModel):
    id: str
    text: str
    type: str  # technology, compliance, budget, timeline, deployment
    value: str
    mandatory: bool = True

class Entity(BaseModel):
    name: str
    type: str  # domain_entity, external_system, user_type
    attributes: List[str] = []
    description: Optional[str] = None

class Relationship(BaseModel):
    source: str
    target: str
    type: str  # requests, manages, processes, contains, depends_on
    cardinality: Optional[str] = None  # one-to-one, one-to-many, many-to-many

class BusinessRule(BaseModel):
    id: str
    text: str
    category: str
    conditions: List[str] = []
    actions: List[str] = []

class RequirementsAnalysisOutput(BaseModel):
    summary: str
    functional_requirements: List[FunctionalRequirement]
    non_functional_requirements: List[NonFunctionalRequirement]
    constraints: List[Constraint]
    actors: List[str]
    entities: List[Entity]
    relationships: List[Relationship]
    business_rules: List[BusinessRule] = []
    technologies_mentioned: List[str] = []
    confidence: float = Field(ge=0.0, le=1.0)
    raw_input: Optional[str] = None

class RequirementsInput(BaseModel):
    requirements_text: str
    context: Optional[str] = None
    domain: Optional[str] = None