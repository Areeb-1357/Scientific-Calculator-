import json
import math
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def calculate(first_number, operator, second_number):
	"""Return the result of a basic arithmetic operation."""
	if operator == "+":
		return first_number + second_number
	if operator == "-":
		return first_number - second_number
	if operator == "*":
		return first_number * second_number
	if operator == "/":
		if second_number == 0:
			raise ValueError("Cannot divide by zero.")
		return first_number / second_number
	if operator == "^":
		return first_number ** second_number
	raise ValueError("Unsupported operator. Use +, -, *, /, or ^.")


def calculate_function(name, value, angle_mode="DEG"):
	"""Return the result of a supported scientific function."""
	if name in {"sin", "cos", "tan"}:
		argument = math.radians(value) if angle_mode == "DEG" else value
		return getattr(math, name)(argument)
	if name == "log" and value > 0:
		return math.log10(value)
	if name == "ln" and value > 0:
		return math.log(value)
	if name == "sqrt" and value >= 0:
		return math.sqrt(value)
	raise ValueError("Value is outside the function domain.")


class CalculatorHandler(SimpleHTTPRequestHandler):
	"""Serve calculation requests for the browser client."""

	def _send_json(self, payload, status=200):
		body = json.dumps(payload).encode("utf-8")
		self.send_response(status)
		self.send_header("Content-Type", "application/json")
		self.send_header("Content-Length", str(len(body)))
		self.end_headers()
		self.wfile.write(body)

	def do_POST(self):
		if self.path != "/api/calculate":
			self._send_json({"error": "Not found."}, 404)
			return

		try:
			length = int(self.headers.get("Content-Length", 0))
			request = json.loads(self.rfile.read(length))
			operation = request.get("operation")
			if operation == "binary":
				result = calculate(float(request["first"]), request["operator"], float(request["second"]))
			elif operation == "function":
				result = calculate_function(request["name"], float(request["value"]), request.get("angleMode", "DEG"))
			else:
				raise ValueError("Unsupported calculation request.")
			if not math.isfinite(result):
				raise ValueError("Calculation result is not finite.")
			self._send_json({"result": result})
		except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
			self._send_json({"error": str(error)}, 400)

	def log_message(self, format_string, *args):
		return


def serve():
	host = os.environ.get("HOST", "127.0.0.1")
	port = int(os.environ.get("PORT", "8000"))
	server = ThreadingHTTPServer((host, port), CalculatorHandler)
	print(f"Calculator API running at http://{host}:{port}")
	print("Press Ctrl+C to stop.")
	try:
		server.serve_forever()
	except KeyboardInterrupt:
		print("\nCalculator API stopped.")
	finally:
		server.server_close()


def main():
	print("Basic Python Calculator")
	print("Enter q at any prompt to quit.")

	while True:
		first_input = input("First number: ").strip()
		if first_input.lower() == "q":
			break

		operator = input("Operator (+, -, *, /): ").strip()
		if operator.lower() == "q":
			break

		second_input = input("Second number: ").strip()
		if second_input.lower() == "q":
			break

		try:
			first_number = float(first_input)
			second_number = float(second_input)
			result = calculate(first_number, operator, second_number)
			print(f"Result: {result:g}")
		except ValueError as error:
			print(f"Error: {error}")


if __name__ == "__main__":
	serve()
