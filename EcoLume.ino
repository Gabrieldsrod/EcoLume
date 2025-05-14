#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

const char* ssid = "GabrielRodrigues";
const char* password = "19092005";
const char* endpoint = "https://6817c88e5a4b07b9d1cd3de9.mockapi.io/api/vi1/bateria";

const int pinoAnalogico = 34;
const int pinoLED1 = 18;
const int pinoLED2 = 19;
const int pinoVent = 14;

unsigned long ultimoEnvio = 0;                 // armazena o tempo do último envio
const unsigned long intervaloEnvio = 3600000;  // 1 hora em milissegundos

// Função map para float
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Inicializa NTP
void configurarRelogioNTP() {
  configTime(-3 * 3600, 0, "pool.ntp.org");  // Fuso horário Brasil
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.println("Aguardando NTP...");
    delay(1000);
  }
}

String getDataHoraISO() {
  struct tm timeinfo;
  getLocalTime(&timeinfo);
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buffer);
}

void setup() {
  pinMode(pinoLED1, OUTPUT);
  pinMode(pinoLED2, OUTPUT);
  pinMode(pinoVent, OUTPUT);

  digitalWrite(pinoVent, LOW);
  digitalWrite(pinoLED1, LOW);
  digitalWrite(pinoLED2, LOW);

  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado.");
  configurarRelogioNTP();
}

void loop() {
  struct tm timeinfo;
  getLocalTime(&timeinfo);
  int horaAtual = timeinfo.tm_hour;

  bool horarioPermitido = (horaAtual >= 19 || horaAtual < 2);

  if (horarioPermitido) {
    digitalWrite(pinoVent, HIGH);
    digitalWrite(pinoLED1, HIGH);
    digitalWrite(pinoLED2, HIGH);
  } else {
    digitalWrite(pinoVent, LOW);
    digitalWrite(pinoLED1, LOW);
    digitalWrite(pinoLED2, LOW);
  }

  unsigned long tempoAtual = millis();
  if (tempoAtual - ultimoEnvio >= intervaloEnvio || ultimoEnvio == 0) {
    ultimoEnvio = tempoAtual;

    int leituraADC = analogRead(pinoAnalogico);
    float tensaoDivisor = mapFloat(leituraADC, 0, 4095, 0.0, 3.3);
    float tensaoBateria = mapFloat(tensaoDivisor, 0.0, 3.3, 0.0, 13.5);

    String horario = getDataHoraISO();

    Serial.print("Tensão da bateria: ");
    Serial.print(tensaoBateria, 2);
    Serial.print(" V | Horário: ");
    Serial.println(horario);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(endpoint);
      http.addHeader("Content-Type", "application/json");

      String corpoJson = "{\"tensao\": " + String(tensaoBateria, 2) + ", \"timestamp\": \"" + horario + "\"}";

      int httpResponseCode = http.POST(corpoJson);
      if (httpResponseCode > 0) {
        Serial.println("Enviado com sucesso!");
      } else {
        Serial.print("Erro ao enviar: ");
        Serial.println(httpResponseCode);
      }

      http.end();
    }
  }

  delay(1000); // Delay pequeno para evitar uso excessivo de CPU
}