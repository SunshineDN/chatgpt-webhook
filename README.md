## Rotas e corpo para requisição

>|Endpoints|Req body|
 |-------------|:-------------:|
 |GET http://localhost:{PORT}/gpt/|none|
 |POST http://localhost:{PORT}/gpt/text|{ message: string }|
 |POST http://localhost:{PORT}/gpt/audio|{ input: string }|
 |DELETE http://localhost:{PORT}/gpt/:leadID|none|
 |POST http://localhost:{PORT}/gpt/:assistant_id/message|{ text: string, leadID: string }|
 |GET http://localhost:{PORT}/gpt/:leadID/message/list|none|