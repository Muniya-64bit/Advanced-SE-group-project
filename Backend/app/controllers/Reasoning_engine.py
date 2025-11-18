from typing import Dict, Any, List

def _text_contains_any(text: str, keywords: List[str]) -> bool:
    t = (text or "").lower()
    return any(kw.lower() in t for kw in keywords if kw)

def _extract_constraint_keywords(constraint: Dict[str, Any]) -> List[str]:
    """Try to derive short keywords from a constraint object/dict."""
    kws = []
    if not constraint:
        return kws
    for field in ("value", "text", "type"):
        v = constraint.get(field) if isinstance(constraint, dict) else None
        if isinstance(v, str):
            kws.extend([w.strip() for w in v.split() if len(w) > 2])
    return kws

def validate_architecture(nlp_json: Dict[str, Any], recommendation_text: str) -> Dict[str, Any]:
    """
    Lightweight validation that ensures the returned recommendation mentions
    the user's hard constraints (deployment platforms, compliance, key tech).
    Returns a summary dict with validity, missing_items and notes.
    """
    missing = []
    notes = []

    # Validate constraints
    constraints = nlp_json.get("constraints", []) or []
    for c in constraints:
        # try to find meaningful keywords for the constraint
        kws = []
        if isinstance(c, dict):
            kws = _extract_constraint_keywords(c)
        else:
            try:
                kws = _extract_constraint_keywords(c.__dict__)
            except Exception:
                kws = []

        # if no keywords found, fallback to full text check
        text_to_check = c.get("text") if isinstance(c, dict) else str(c)
        if kws:
            if not _text_contains_any(recommendation_text, kws):
                missing.append({"constraint": text_to_check, "keywords": kws})
        else:
            if text_to_check and text_to_check.lower() not in (recommendation_text or "").lower():
                missing.append({"constraint": text_to_check, "keywords": []})

    # Basic sanity checks: recommendation should be non-empty and reasonably long
    if not recommendation_text or len(recommendation_text) < 50:
        notes.append("Recommendation appears too short to be a complete architecture.")

    valid = len(missing) == 0 and not notes

    return {
        "valid": valid,
        "missing_constraints": missing,
        "notes": notes
    }