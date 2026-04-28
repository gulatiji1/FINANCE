def build_symbol_candidates(symbol: str) -> list[str]:
    clean_symbol = symbol.strip().upper()
    if not clean_symbol:
        return []

    if clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO"):
        return [clean_symbol]

    return [f"{clean_symbol}.NS", f"{clean_symbol}.BO", clean_symbol]

