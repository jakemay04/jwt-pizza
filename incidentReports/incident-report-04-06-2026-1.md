# Incident Report: 04/06/2026

## Summary
Between the hour of 13:00 and 14:00 on 4/6/2026, a high rate of failure occurred with the ordering of JWT pizzas. The event was triggered by a failure of orders on the side of the Pizza factory. The event was detected by grafana alerts notifying the increased rate of pizza order failure. The team started working on the event by tracing the client side errors to a link in the http response body that led to resolving the incident at the factory. The system was out for approximately 45 minutes.

## Detection
The incident was detected when the Pizza purchase fail rate was triggered and I was alerted by email. Detection was within minutes of the initial failure due to looping curl requests that were testing all endpoints. Possible improvements could be different notification styles other than email, like phone notification or text.

## Impact
For 45 minutes between 13:15 and 14:00, all our users were unable to successfully purchase any JWT pizzas from all stores.

## Timeline
13:15 - an alert was triggered that JWT pizza failure rate was rising.

13:20 - the problem was analyzed.

13:30 - an attempt to restart the server was attempted, but solved nothing

13:40 - the client side http 500 error was traced to the backend order endpoint.

13:50 - the link was discovered in the HTTP body that allowed for the factory to resume production

13:55 - JWT pizza orders were functioning as expected.

## Response
I was able to respond to the incident almost immediately, but was delayed resolving the issue since I was at my office of employment. When I was available, I attempted different debug strategies like tracing the error path. After looking extensively at the code, I realized there was a link to resolve the issue and clicked it.

## Root Cause
Failure of JWT pizza factory to deliver pizzas. An overdependancy on one source for the JWT pizzas, with no backup option in case of failure.

## Resolution
By clicking on the link, the JWT pizza factory was able to be back up and running instantly.

## Prevention
Eliminating dependency on JWT pizza factory, not clicking the chaos button.

## Action Items
Ensure active metrics and logging are functioning correctly
Create more alerts for different metrics in case of failure.
Avoid all buttons that say “initiate chaos”

