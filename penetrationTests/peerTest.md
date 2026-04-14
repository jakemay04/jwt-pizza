Self test 1 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 0, Did not work                                                                              |
| Description    | SQL injection attempt to delete database in login page, unsuccessful               |
| Images         | <img width="500" height="auto" alt="self-test-1" src="https://github.com/user-attachments/assets/b5ca0104-a320-4be0-9b38-6b3ae206d9d1" /> |
| Corrections    | Ensure all login text is sanitized.            

Self test 2 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Identification and Authentication Failures                                                                      |
| Severity       | 2                                                                              |
| Description    | Any user can be logged into with a blank password. Only front end checks for password content                |
| Images         | <img width="914" height="725" alt="Screenshot 2026-04-13 220106" src="https://github.com/user-attachments/assets/d364148f-6a7a-4234-a563-9c9bbeac0c97" /> |
| Corrections    | Change password authentication to check for blank passwords.            

Self test 3 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Cryptographic Failures                                                                      |
| Severity       | 3 (if we used real bitcoin)                                                                              |
| Description    | Order json can be edited before being sent back to factory. Prices have no security, can be altered completely.                |
| Images         |<img width="500" height="auto" alt="self-test-3" src="https://github.com/user-attachments/assets/f804afc0-10cd-48eb-8502-830f76166793" /> |
| Corrections    | Secure json objects to be checked before processed, especially for payments      

Self test 4 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Identification and Authentication Failures                                                                      |
| Severity       | 1                                                                              |
| Description    | When registering, the backend does not verify that the account email already exsists. This allows you to create an account with the same email as many times as you want.                |
| Images         |<img width="500" height="auto" alt="self-test-4" src="https://github.com/user-attachments/assets/86808275-f1d1-443c-94ba-85ed68d1957f" /> |
| Corrections    | Add check to see if email is already in use. 

Self test 5 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 3                                                                              |
| Description    | When update user json in intercepted, sql query injections are allowed through the name field.                |
| Images         |<img width="500" height="auto" alt="self-test-5" src="https://github.com/user-attachments/assets/d9eb19d0-41fa-4f33-92e4-7e115b740031" /> |
| Corrections    | Sanitize all sql queries for injection attacts
