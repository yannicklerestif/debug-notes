There are two topics per user. Each will be marked inactive as per the rules below. If both are inactive, we can remove the UserTopics object.
# Browser Topic
## State
The browsers topic object contains:
- A single messages queue, that **we can’t remove it without removing the whole topic.**
	- The queue contains messages that can be removed individually
- Senders are stateless
## Cleanup
- **TL;DR**: remove all messages sent more than 10 minutes ago from the queue. If the queue is empty and nobody has sent any message for 10 minutes, consider the topic inactive.
- **Sender side**: we must keep the topic while messages are being sent (even if nobody is listening), because if we clean it up we will keep cleaning it up and recreating it.
- **Poller side**: browser message are actions, it would be best not to lose them, but it Who would be confusing if a bozo picked up old messages on startup. So if nobody is listening, we discard the messages after a while.
# IDEs Topic
## State
The IDEs topic contains one queue per on-going poll (1 poll <-> 1 IDE). Messages are added to all queues.
## Cleanup
- Remove IDE queue if no poll for 10 minutes
- Mark topic as inactive if no queues left and no message sent for 10 minutes.