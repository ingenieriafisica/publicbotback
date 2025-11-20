# PublicBot Backend

`publicbot-backend` es un robusto backend diseñado para un chatbot público, enfocado en proporcionar respuestas precisas y contextuales a través de la **Generación Aumentada por Recuperación (RAG)**. Esta aplicación, construida con **NestJS**, integra modelos de lenguaje avanzados y una base de conocimientos dinámica para ofrecer una experiencia de usuario fluida y eficiente.

## Características Principales ✨

* **Chatbot con RAG**: Implementa un sistema RAG para enriquecer las respuestas del chatbot con información relevante de una base de conocimientos.
* **Múltiples Modelos de Lenguaje**: Soporte para la integración con **Groq** y **Ollama**, permitiendo flexibilidad en la elección del modelo de IA.
* **Gestión de Checkpoints con LangGraph**: Utiliza `langgraph-checkpoint-mongodb` para gestionar el estado de las conversaciones, permitiendo flujos complejos y persistencia del historial.
* **Vector Store con MongoDB Atlas**: Almacena y realiza búsquedas de similitud en documentos para el RAG, aprovechando las capacidades de **Vector Search** de MongoDB Atlas.
* **Extracción de Texto Avanzada**: Capacidad para procesar y extraer texto de diversos formatos, como **PDF** y **HTML**, utilizando librerías como `pdf-parse`, `cheerio`, `jsdom` y `html-to-text`.
* **Autenticación y Seguridad**: Protege los *endpoints* de la API mediante **Passport-JWT**, asegurando que solo los usuarios autorizados puedan interactuar con el sistema.
* **Monitoreo de Métricas**: Integra **Prometheus** para la recolección y exposición de métricas de la aplicación, facilitando la monitorización del rendimiento y la salud.

---

## Tecnologías Utilizadas 🛠️

* **Backend**: [NestJS](https://nestjs.com/)
* **Base de Datos**: [MongoDB](https://www.mongodb.com/) (con [Mongoose](https://mongoosejs.com/))
* **Modelos de Lenguaje**: [LangChain](https://js.langchain.com/), [Groq SDK](https://groq.com/docs/api), [Ollama](https://ollama.com/)
* **Orquestación LLM**: [LangGraph](https://langchain-ai.github.io/langgraphjs/)
* **Validación de Datos**: [`class-validator`](https://github.com/typestack/class-validator)
* **Autenticación**: [Passport.js](https://www.passportjs.org/) (JWT y Local Strategy)
* **Manejo de Métricas**: [`@willsoto/nestjs-prometheus`](https://github.com/willsoto/nestjs-prometheus)
* **HTTP Client**: [`@nestjs/axios`](https://docs.nestjs.com/recipes/http-module)

---

## Requisitos Previos 🚀

Antes de empezar, asegúrate de tener instalado lo siguiente en tu sistema:

* **Node.js**: `v16.x` o superior
* **npm** o **yarn**: Gestor de paquetes de Node.js
* **Docker**: Para ejecutar Ollama y/o MongoDB localmente (opcional, si no usas Atlas)
* **Ollama**: Si plane"# publicbotback" 
