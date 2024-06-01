## Rotas e corpo para requisição

|Endpoints|Req body|Req Params|
|-------------|:-------------:|:-------------:|
|GET http://localhost:{PORT}/|none|none|
|POST http://localhost:{PORT}/text|{ message: string }|none|
|POST http://localhost:{PORT}/audio-to-text|{ audio_link: string, lead_id: string }|none|
|POST http://localhost:{PORT}/text-to-audio|{ message: string, phone: string }|none|
|DELETE http://localhost:{PORT}/thread/:leadID|none|leadID = Id do Lead vindo do Kommo|
|POST http://localhost:{PORT}/:assistant_id/message|{ text: string, leadID: string }|assistant_id = Id do assistente GPT codificado em base 64|
|POST http://localhost:{PORT}/message|{ text: string }|none|
|GET http://localhost:{PORT}/:leadID/message/list|none|leadID = Id do Lead vindo do Kommo|
