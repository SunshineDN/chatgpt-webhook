## Rotas e corpo para requisição

|Endpoints|Req body|Req Params|
|-------------|:-------------:|:-------------:|
|GET http://localhost:{PORT}/|none|none|
|POST http://localhost:{PORT}/text|{ message: string }|none|
|POST http://localhost:{PORT}/audio|{ input: string }|none|
|DELETE http://localhost:{PORT}/:leadID|none|leadID = Id do Lead vindo do Kommo|
|POST http://localhost:{PORT}/:assistant_id/message|{ text: string, leadID: string }|assistant_id = Id do assistente GPT codificado em base 64|
|GET http://localhost:{PORT}/:leadID/message/list|none|leadID = Id do Lead vindo do Kommo|
