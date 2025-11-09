from langchain_core.tools import tool

@tool(parse_docstring=True)
def reboot_server(server_id):
    """Reboots the server with the given server ID."""
    print(f"SERVER WITH ID {server_id} REBOOTING!")
    return "Server rebooted successfully."