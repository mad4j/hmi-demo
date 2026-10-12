import xml.etree.ElementTree as ET
import yaml
import re
import os


# ============================================================
# YAML inline helper
# ============================================================

def represent_inline_options(dumper, data):
    return dumper.represent_sequence(
        "tag:yaml.org,2002:seq",
        data,
        flow_style=True
    )

class InlineOptions(list):
    pass

yaml.add_representer(InlineOptions, represent_inline_options)


# ============================================================
# Utility
# ============================================================

def sanitize_id(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')


# ============================================================
# TYPE INFERENCE
# ============================================================

def infer_type(simple):
    xml_type = (simple.get("type") or "").lower()
    name = (simple.get("name") or "").lower()
    enumerations = simple.find("enumerations")

    if "password" in name:
        return "password"

    if any(x in name for x in ["apply", "start", "stop", "reset"]):
        return "button"

    if enumerations is not None:
        return "enum"

    if xml_type == "boolean":
        return "boolean"

    if xml_type in ["long", "ulong", "short", "ushort", "float", "double", "integer", "int"]:
        return "number"

    description = simple.find("description")
    if description is not None and description.text:
        if len(description.text) > 80:
            return "textarea"

    return "text"


# ============================================================
# OPTIONS
# ============================================================

def extract_options(simple):
    enums = simple.find("enumerations")
    xml_type = (simple.get("type") or "").lower()

    if xml_type == "boolean":
        return {
            "optionsLabel": InlineOptions(["ON", "OFF"]),
            "optionsValue": InlineOptions([1, 0])
        }

    if enums is None:
        return None

    labels = []
    values = []

    for enum in enums.findall("enumeration"):
        label = enum.get("label")
        value = enum.get("value")

        if label is not None:
            labels.append(label)

        if value is not None:
            try:
                values.append(int(value))
            except:
                values.append(value)

    if not labels:
        return None

    return {
        "optionsLabel": InlineOptions(labels),
        "optionsValue": InlineOptions(values)
    }


# ============================================================
# RANGE / UNIT / PRECISION
# ============================================================

def extract_range(simple):
    range_node = simple.find("range")
    if range_node is None:
        return None, None
    return range_node.get("min"), range_node.get("max")


def extract_unit(simple):
    unit_node = simple.find("units")
    if unit_node is not None and unit_node.text:
        return unit_node.text.strip()
    return None


def extract_precision(simple):
    digits = simple.get("digits")
    if digits:
        try:
            return int(digits)
        except:
            pass
    return 0


# ============================================================
# PARAMETER BUILDER
# ============================================================

def build_parameter(simple):
    param_id = simple.get("id", "no_id")
    name = simple.get("name", "unknown")

    desc_node = simple.find("description")
    description = desc_node.text.strip() if desc_node is not None and desc_node.text else None

    parameter = {
        "id": param_id,
        "name": name,
    }

    if description:
        parameter["description"] = description

    field_type = simple.get("type")
    if field_type:
        parameter["field"] = field_type

    param_type = infer_type(simple)
    parameter["type"] = param_type

    # BOOLEAN override
    if (field_type or "").lower() == "boolean":
        parameter["type"] = "enum"
        parameter["optionsLabel"] = InlineOptions(["ON", "OFF"])
        parameter["optionsValue"] = InlineOptions([0, 1])

    if simple.get("mode") == "readonly":
        parameter["readonly"] = True

    if simple.get("localVisible") == "false":
        parameter["visibility"] = "hidden"

    if simple.get("mandatory") == "true":
        parameter["required"] = True

    options = extract_options(simple)
    if options:
        parameter.update(options)

    if parameter["type"] == "number":
        unit = extract_unit(simple)
        if unit:
            parameter["unit"] = unit

        parameter["precision"] = extract_precision(simple)
        min_val, max_val = extract_range(simple)

        def smart_number(value):
            if value is None:
                return None
            try:
                n = float(value)
                return int(n) if n.is_integer() else n
            except:
                return value

        if min_val is not None:
            parameter["min"] = smart_number(min_val)
        if max_val is not None:
            parameter["max"] = smart_number(max_val)

    if parameter["type"] in ["password", "text"]:
        parameter["clearOnApply"] = True

    return parameter


# ============================================================
# PANEL BUILDERS
# ============================================================

def build_summary_panel(root, label_name):
    # Cerca il tag <summary>
    summary = root.find(".//summary")
    if summary is None:
        return None

    panel = {
        "label": label_name,
        "parameters": []
    }

    for simple in summary.findall("simple"):
        panel["parameters"].append(build_parameter(simple))

    return panel


def build_parameters_panel(root, label_name):
    # Cerca il tag <parametersmenu>
    parameters_menu = root.find(".//parametersmenu")
    if parameters_menu is None:
        return None

    root_node = parameters_menu.find("node")
    if root_node is None:
        return None

    panel = {
        "label": label_name,
        "submenus": []
    }

    for submenu_node in root_node.findall("node"):
        panel["submenus"].append(build_submenu(submenu_node))

    return panel


# ============================================================
# SUBMENU
# ============================================================

def build_panel(node):
    panel = {
        "label": node.get("name", "Panel"),
        "parameters": []
    }

    for simple in node.findall("simple"):
        panel["parameters"].append(build_parameter(simple))

    return panel


def build_submenu(node):
    submenu = {
        "id": sanitize_id(node.get("id", "submenu")),
        "label": node.get("name", "submenu"),
        "icon": node.get("name", "submenu").lower(),
    }

    parameters = []
    for simple in node.findall("simple"):
        parameters.append(build_parameter(simple))

    if parameters:
        submenu["parameters"] = parameters

    child_nodes = node.findall("node")
    if child_nodes:
        submenu["panels"] = []
        for child in child_nodes:
            submenu["panels"].append(build_panel(child))

    return submenu


# ============================================================
# MAIN CONVERTER
# ============================================================

def convert_xml_to_yaml(xml_file, yaml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Estrae il nome del file senza estensione (es. "vulos.xml" -> "Vulos")
    base_name = os.path.splitext(os.path.basename(xml_file))[0]
    formatted_name = base_name.capitalize() 

    yaml_data = {
        "pages": []
    }

    page = {
        "id": f"waveform {base_name}", 
        "label": "Waveform",
        "icon": "settings",
        "parameters": [],
        "panels": [] # Array inizialmente vuoto
    }

    # 1. Mappa <summary> nel primo pannello
    summary_panel = build_summary_panel(root, formatted_name)
    if summary_panel:
        page["panels"].append(summary_panel)

    # 2. Mappa <parametersmenu> nel secondo pannello
    parameters_panel = build_parameters_panel(root, f"{formatted_name} Menu")
    if parameters_panel:
        page["panels"].append(parameters_panel)

    yaml_data["pages"].append(page)

    with open(yaml_file, "w", encoding="utf-8") as f:
        yaml.dump(
            yaml_data,
            f,
            allow_unicode=True,
            sort_keys=False
        )

    print(f"YAML generato: {yaml_file}")


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    # Assicurati che i percorsi siano corretti prima di lanciarlo
    convert_xml_to_yaml(
        "/home/shared/hmi-demo-react/hmi-demo-main/script/waveform.xml",
        "/home/shared/hmi-demo-react/hmi-demo-main/script/waveform.yaml"
    )