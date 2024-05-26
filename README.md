## Rotas e corpo para requisição

>|Endpoints|Req body|Req Params|
 |-------------|:-------------:|:-------------:|
 |GET http://localhost:{PORT}/gpt/|none|none|
 |POST http://localhost:{PORT}/gpt/text|{ message: string }|none|
 |POST http://localhost:{PORT}/gpt/audio|{ input: string }|none|
 |DELETE http://localhost:{PORT}/gpt/:leadID|none|leadID = Id do Lead vindo do Kommo|
 |POST http://localhost:{PORT}/gpt/:assistant_id/message|{ text: string, leadID: string }|assistant_id = Id do assistente GPT codificado em base 64|
 |GET http://localhost:{PORT}/gpt/:leadID/message/list|none|leadID = Id do Lead vindo do Kommo|