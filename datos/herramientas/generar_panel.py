"""Genera datos/panel.json (datos de demostración del panel de la dueña).

Determinista (semilla fija). 60 días: los 30 últimos son el periodo actual y los 30 anteriores, el de
comparación. Uso: python3 generar_panel.py
"""
import json, math, os, random
from datetime import date, timedelta

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(os.path.dirname(AQUI), "panel.json")

PRECIOS = {
    "p01": 12.99, "p02": 29.99, "p03": 17.99, "p04": 24.99, "p05": 18.99, "p06": 19.99, "p07": 22.99,
    "p08": 19.99, "p09": 39.99, "p10": 24.99, "p11": 21.99, "p12": 49.99, "p13": 19.99, "p14": 34.99,
    "p15": 22.99, "p16": 16.99, "p17": 44.99, "p18": 39.99, "p19": 29.99, "p20": 27.99,
}
# Peso de cada producto en las ventas (los más vendidos pesan más)
PESOS = {
    "p12": 9, "p04": 7, "p09": 6, "p14": 6, "p02": 5, "p03": 5, "p08": 5, "p18": 4, "p13": 3, "p11": 3,
    "p15": 3, "p07": 2, "p10": 2, "p16": 2, "p19": 2, "p20": 2, "p05": 2, "p06": 1, "p01": 2, "p17": 1,
}
ULTIMO_DIA = date(2026, 10, 18)  # la víspera de la demo; la pantalla puede reanclar las fechas


def main():
    rnd = random.Random(1910)
    dias = []
    for i in range(60):
        d = ULTIMO_DIA - timedelta(days=59 - i)
        tendencia = 1 + 0.004 * i  # crece poco a poco: el periodo actual vende algo más
        finde = 1.25 if d.weekday() >= 5 else 1.0
        visitas = int(rnd.gauss(720, 70) * tendencia * finde)
        conversion = max(0.012, rnd.gauss(0.024, 0.003))
        pedidos = max(4, round(visitas * conversion))
        ticket = rnd.gauss(43.5, 4.0)
        ventas = round(pedidos * ticket, 2)
        dias.append({"date": d.isoformat(), "sales": ventas, "orders": pedidos, "visitors": visitas})

    actual = dias[30:]
    visitas = sum(x["visitors"] for x in actual)
    compras = sum(x["orders"] for x in actual)
    embudo = {
        "visitors": visitas,
        "productViews": round(visitas * 0.41),
        "addedToCart": round(visitas * 0.089),
        "checkout": round(compras / 0.62),
        "purchased": compras,
    }

    unidades_totales = round(compras * 1.6)
    peso_total = sum(PESOS.values())
    mas_vendidos = []
    for pid, peso in sorted(PESOS.items(), key=lambda kv: -kv[1])[:5]:
        u = round(unidades_totales * peso / peso_total)
        mas_vendidos.append({"productId": pid, "units": u, "revenue": round(u * PRECIOS[pid], 2)})

    avisos = [
        {
            "id": "a1", "severity": "high",
            "title": {"en": "Magnetic tiles are out of stock in Seattle, Los Angeles and Miami",
                      "es": "Los bloques magnéticos se agotaron en Seattle, Los Ángeles y Miami"},
            "body": {"en": "They are your best seller. Houston has 6 and New York has 7.",
                     "es": "Es tu producto más vendido. Houston tiene 6 y Nueva York, 7."},
            "action": {"en": "Move 3 units from Houston to Seattle", "es": "Pasa 3 unidades de Houston a Seattle"},
            "href": "#stock",
        },
        {
            "id": "a2", "severity": "medium",
            "title": {"en": "Only 3 teddy bears left in the online warehouse",
                      "es": "Solo quedan 3 osos de peluche en la bodega online"},
            "body": {"en": "At this pace they run out in about 2 days.",
                     "es": "A este ritmo se acaban en unos 2 días."},
            "action": {"en": "Reorder from your supplier", "es": "Pide más a tu proveedor"},
            "href": "#stock",
        },
        {
            "id": "a3", "severity": "medium",
            "title": {"en": "4 out of 10 people leave at checkout",
                      "es": "4 de cada 10 personas se van en el pago"},
            "body": {"en": "They add to the cart and start paying, but don’t finish. Showing the delivery date earlier usually helps.",
                     "es": "Agregan al carrito y empiezan a pagar, pero no terminan. Enseñar antes la fecha de entrega suele ayudar."},
            "action": {"en": "Review the checkout steps", "es": "Revisa los pasos del pago"},
            "href": "#embudo",
        },
        {
            "id": "a4", "severity": "low",
            "title": {"en": "Black Friday is on November 27",
                      "es": "El Black Friday es el 27 de noviembre"},
            "body": {"en": "Parents start looking for gifts 3–4 weeks before.",
                     "es": "Los papás empiezan a buscar regalos 3 o 4 semanas antes."},
            "action": {"en": "Prepare a gift guide by age", "es": "Prepara una guía de regalos por edad"},
        },
    ]

    # ——— Lo que se agregó el 16-10 (panel ampliado). Semilla aparte: lo de arriba no cambia. ———
    extra = random.Random(2410)

    # Clics y carrito por producto. El interés no siempre sigue a las ventas: el telescopio (p17) y el
    # kit de robots (p18) se miran mucho y se venden poco; el arcoíris de madera (p05), al revés.
    interes = {pid: peso * extra.uniform(0.8, 1.2) for pid, peso in PESOS.items()}
    interes.update({"p17": 7.5, "p18": 7.0, "p05": 1.0})
    total_interes = sum(interes.values())
    carrito_peso = {pid: PESOS[pid] * extra.uniform(0.85, 1.2) for pid in PESOS}
    total_carrito = sum(carrito_peso.values())
    productos = []
    for pid in sorted(PESOS):
        u = round(unidades_totales * PESOS[pid] / peso_total)
        productos.append({
            "productId": pid,
            "views": round(embudo["productViews"] * interes[pid] / total_interes),
            "addedToCart": round(embudo["addedToCart"] * carrito_peso[pid] / total_carrito),
            "units": u,
            "revenue": round(u * PRECIOS[pid], 2),
        })

    # Lo que buscan (sin marcas). Las que no tienen resultados son lo que piden y no tienes.
    busquedas = []
    for i, (texto, hay) in enumerate([
        ("magnetic tiles", True), ("regalo niño 5 años", True), ("teddy bear", True), ("play kitchen", False),
        ("science kit", True), ("rc car", True), ("dollhouse", False), ("puzzle", True),
        ("bike helmet", False), ("xilófono", True),
    ]):
        busquedas.append({"term": texto, "count": round(430 * 0.78 ** i * extra.uniform(0.92, 1.08)), "results": hay})

    def reparto(pesos, total):
        suma = sum(pesos.values())
        return {k: round(total * v / suma) for k, v in pesos.items()}

    dispositivos = [
        {"device": k, "visitors": v, "orders": o}
        for (k, v), o in zip(
            reparto({"mobile": 68, "desktop": 26, "tablet": 6}, visitas).items(),
            reparto({"mobile": 58, "desktop": 36, "tablet": 6}, compras).values(),
        )
    ]
    origen_visitas = reparto({"instagram": 31, "google": 27, "direct": 18, "facebook": 11, "email": 8, "tiktok": 5}, visitas)
    origen_pedidos = reparto({"instagram": 27, "google": 30, "direct": 21, "facebook": 8, "email": 11, "tiktok": 3}, compras)
    fuentes = [{"source": k, "visitors": v, "orders": origen_pedidos[k]} for k, v in origen_visitas.items()]

    nuevos = round(compras * 0.71)
    clientes = {"newOrders": nuevos, "returningOrders": compras - nuevos}

    ventas_act = sum(x["sales"] for x in actual)
    estados = []
    for codigo, peso in [("CA", 22), ("TX", 13), ("FL", 10), ("NY", 9), ("WA", 7), ("IL", 5)]:
        estados.append({"state": codigo, "orders": round(compras * peso / 100), "revenue": round(ventas_act * peso / 100, 2)})

    # Pedidos por hora: al mediodía y, sobre todo, de 8 a 10 de la noche (cuando los niños ya duermen).
    forma = [
        0.05 + math.exp(-((h - 12.5) ** 2) / 5) * 0.55 + math.exp(-((h - 21) ** 2) / 3) * 1.0 + extra.uniform(0, 0.06)
        for h in range(24)
    ]
    horas = list(reparto({h: f for h, f in enumerate(forma)}, compras).values())

    datos = {
        "days": dias, "funnel": embudo, "bestSellers": mas_vendidos, "alerts": avisos,
        "products": productos, "searches": busquedas, "devices": dispositivos, "sources": fuentes,
        "customers": clientes, "states": estados, "hours": horas,
    }
    with open(SALIDA, "w") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
        f.write("\n")
    v_act = sum(x["sales"] for x in dias[30:]); v_ant = sum(x["sales"] for x in dias[:30])
    print(f"panel.json: ventas 30 días {v_act:.2f} (antes {v_ant:.2f}, {100*(v_act/v_ant-1):+.1f} %), pedidos {compras}")


if __name__ == "__main__":
    main()
