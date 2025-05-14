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
float converterTensao(float leitura, float entradaMin, float entradaMax, float saidaMin, float saidaMax) {
  return (leitura - entradaMin) * (saidaMax - saidaMin) / (entradaMax - entradaMin) + saidaMin;
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
  configurarRelogioNTP();  // Configura o relógio NTP com o fuso horário correto
}

void loop() {
  struct tm timeinfo;  // Estrutura para armazenar informações de data e hora
  getLocalTime(&timeinfo);  // Obtém a hora local
  int horaAtual = timeinfo.tm_hour;  // Obtém a hora atual (0-23)

  bool horarioPermitido = (horaAtual >= 19 || horaAtual < 2); // Permite funcionamento entre 19h e 2h

  if (horarioPermitido) {
    digitalWrite(pinoVent, HIGH);
    digitalWrite(pinoLED1, HIGH);
    digitalWrite(pinoLED2, HIGH);
  } else {
    digitalWrite(pinoVent, LOW);
    digitalWrite(pinoLED1, LOW);
    digitalWrite(pinoLED2, LOW);
  }

  unsigned long tempoAtual = millis();    // Retorna o tempo em milissegundos desde a ativação do circuito
  if (tempoAtual - ultimoEnvio >= intervaloEnvio || ultimoEnvio == 0) {   // Verifica se é hora de enviar os dados
    ultimoEnvio = tempoAtual; // Atualiza o tempo do último envio com o tempo atual     

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
      http.addHeader("Content-Type", "application/json"); // Define o tipo de conteúdo como JSON

      String corpoJson = "{\"tensao\": " + String(tensaoBateria, 2) + ", \"timestamp\": \"" + horario + "\"}";  // Cria o corpo JSON contendo a tensão e o timestamp
      Serial.println("Corpo JSON: " + corpoJson); // Imprime o corpo JSON para depuração

      int httpResponseCode = http.POST(corpoJson); // Envia o POST com o corpo JSON
      if (httpResponseCode > 0) {
        Serial.println("Enviado com sucesso!");
      } else {
        Serial.print("Erro ao enviar: ");
        Serial.println(httpResponseCode);
      }

      http.end(); // Libera os recursos utilizados pela requisição HTTP
    }
  }

  delay(1000); // Delay pequeno para evitar uso excessivo de CPU
}