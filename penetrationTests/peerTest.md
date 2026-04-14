Self test 1 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Injection                                                                      |
| Severity       | 0, Did not work                                                                              |
| Description    | SQL injection attempt to delete database in login page, unsuccessful               |
| Images         | ![Dead database](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Ensure all user text is sanitized.            

Self test 2 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Identification and Authentication Failures                                                                      |
| Severity       | 3                                                                              |
| Description    | Any user can be logged into with a blank password. Only front end checks for password content                |
| Images         | ![200 login for blank password](deadDatabase.png) <br/> Stores and menu no longer accessible. |
| Corrections    | Change password authentication to check for blank passwords.            

Self test 3 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Cryptographic Failures                                                                      |
| Severity       | 3                                                                              |
| Description    | Order json can be edited before being sent back to factory. Prices have no security, can be altered completely.                |
| Images         |  |
| Corrections    | Secure json objects to be checked before processed, especially for payments      

Self test 4 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | Identification and Authentication Failures                                                                      |
| Severity       | 3                                                                              |
| Description    | When registering, the backend does not verify that the account email already exsists. This allows you to create an account with the same email as many times as you want.                |
| Images         |  |
| Corrections    | Add check to see if email is already in use. 

Self test 5 - Jake May
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13th, 2026                                                                  |
| Target         | pizza.jakepizza.click                                                       |
| Classification | SQL injection                                                                      |
| Severity       | 5                                                                              |
| Description    | When update user json in intercepted, sql query injections are allowed through the name field.                |
| Images         |  |
| Corrections    | Sanitize all sql queries for injection attacts