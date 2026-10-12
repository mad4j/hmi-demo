import xml.etree.ElementTree as ET
import yaml
import re

from pathlib import Path
def genera_id(descrizione):
    """
    Converte una descrizione in un id compatibile YAML.
    Esempio:
    'Crypto Unit memory error' -> 'crypto_unit_memory_error'
    """
    testo = descrizione.lower()
    testo = re.sub(r'[^a-z0-9]+', '_', testo)
    return testo.strip('_')


def visibilita_backend(fault):
    """
    Esempio di logica backend per decidere la visibility.

    Personalizza questa funzione con la tua logica reale.
    """

    severity = fault.get("Severity", "")
    bit_phase = fault.get("BIT_Phases", "")

    # Esempio:
    # High + PI => visibile
    # altri => hidden
    if severity == "High" and bit_phase == "PI":
        return "visible"

    return "hidden"


def converti_xml_in_yaml(xml_file, yaml_file):
    # Parsing XML

    p = Path(xml_file)

    print("Esiste:", p.exists())
    print("Path assoluto:", p.resolve())

    # dimensione file
    print("Dimensione:", p.stat().st_size, "bytes")

    # lettura binaria
    data = p.read_bytes()

    print("Primi 100 byte:")
    print(data[:100])

    print("\nPrimi 100 byte decodificati:")
    print(data[:100].decode("utf-8", errors="replace"))
    tree = ET.parse(xml_file)
    root = tree.getroot()

    yaml_data = {
        "pages": [
            {
                "id": "allarmi",
                "label": "Alarms",
                "icon": "alarm",
                "parameters": []
            }
        ]
    }

    parameters = yaml_data["pages"][0]["parameters"]

    # Ciclo su tutti i Fault
    for fault in root.findall("Fault"):

        fic = fault.get("FIC")

        element = fault.find("Element")

        if element is None:
            continue

        description = element.get("Description", f"Fault_{fic}")

        parametro = {
            "id": genera_id(description),
            "name": description,
            "type": "boolean",
            "readonly": True
        }

        # Visibility dinamica da backend
        visibility = visibilita_backend(element.attrib)

        if visibility == "hidden":
            parametro["visibility"] = "hidden"

        parameters.append(parametro)

    # Scrittura YAML
    with open(yaml_file, "w", encoding="utf-8") as f:
        yaml.dump(
            yaml_data,
            f,
            allow_unicode=True,
            sort_keys=False
        )

    print(f"YAML generato: {yaml_file}")


if __name__ == "__main__":

    converti_xml_in_yaml(
        xml_file="/home/shared/hmi-demo-react/hmi-demo-main/script/allarmi.xml",
        yaml_file="/home/shared/hmi-demo-react/hmi-demo-main/script/allarmi.yaml"
    )