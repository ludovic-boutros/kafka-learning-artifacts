# Kafka KRaft: two-DC network partition walkthrough

An interactive, animated page that walks through what happens to **one partition** when the network link between two data centers is cut, then restored, on a KRaft-based Apache Kafka cluster.

It shows step by step:

- which side keeps the **KRaft controller quorum**
- how the **isolated old leader** keeps accepting writes but can't commit them (its ISR can't shrink without the controller)
- **broker fencing** and the clean election of a new leader on the quorum side
- why `acks=all` requests time out and offset commits return `COORDINATOR_NOT_AVAILABLE`
- what happens at **heal**: `OffsetForLeaderEpoch`, **truncation** of the divergent suffix, and rejoining the ISR
- which client writes survive (`acks=all` + idempotence) and which are silently lost (`acks=0/1`)

A scenario switch offers three paths:

- **Active ctrl in DC-A:** the active controller sits on the majority side.
- **Active ctrl in DC-B:** an extra controller-election step shows the outcome is the same, just a few seconds later.
- **Split brain:** an operator in DC-B mistakes the cut for a DC-A outage and forces controller 3 into a standalone quorum while DC-A is still alive. Both sides elect a leader and commit different records at the same offsets. When the link heals, one side has to be rebuilt, and its acknowledged writes (`acks=all` included) are lost. Kafka never does this by itself; it takes a manual forced recovery.

## View it

The page is a single self-contained `index.html`: no build step, no dependencies, no network calls.

- **Locally:** open `index.html` in a browser.
- **Published:** it's deployed by the repository-level GitHub Pages workflow (see the [repository README](../README.md)) at `https://<owner>.github.io/<repo>/kafka-kraft-two-dc-partition/`, and it's listed in the top-level menu. The **← All artifacts** link goes back to that menu.

Controls: **Back / Next** buttons, clickable step dots, **Play / Pause**, the **← →** arrow keys, and **◐** to switch between light and dark themes. Printing (or "Save as PDF") lists every step of the selected scenario.

## Folder layout

```
kafka-kraft-two-dc-partition/
├── index.html   # the interactive walkthrough
└── README.md    # this file (not published)
```

## Assumptions

The scenario is illustrative, not a specific production layout:

- 4 brokers split 2 + 2 across DC-A and DC-B; 3 dedicated KRaft controllers split 2 (DC-A) + 1 (DC-B)
- one partition with replication factor 4, led by broker 3 (DC-B) at leader epoch 7 before the cut
- default timeouts: `broker.session.timeout.ms` 9 s, `replica.lag.time.max.ms` 30 s, `controller.quorum.fetch.timeout.ms` 2 s, `controller.quorum.election.timeout.ms` 1 s
- `min.insync.replicas` ≤ 2 and `unclean.leader.election.enable=false`
- split-brain scenario only: controller 3's voter set is forced to `{3}` (for example `kafka-metadata-recovery reconfig force-standalone`, or editing `controller.quorum.voters` on a static quorum) while DC-A keeps running; at recovery, DC-A is kept and DC-B is rebuilt
- offsets and timings are illustrative; measure the real timings in your own failover test

## Sources

- [KIP-497: Add inter-broker API to alter ISR](https://cwiki.apache.org/confluence/display/KAFKA/KIP-497:+Add+inter-broker+API+to+alter+ISR) and [apache/kafka PR #9100](https://github.com/apache/kafka/pull/9100): only the controller changes the ISR; the leader keeps the previous ("maximal") ISR until a shrink is confirmed
- [KIP-101](https://cwiki-test.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation) and [KIP-279](https://cwiki.apache.org/confluence/display/KAFKA/KIP-279:+Fix+log+divergence+between+leader+and+follower+after+fast+leader+fail+over): leader epochs, `OffsetForLeaderEpoch` and follower truncation
- [KIP-595: A Raft Protocol for the Metadata Quorum](https://cwiki.apache.org/confluence/x/Li7cC): metadata records are committed once a majority of voters has them
- [GroupCoordinatorService error handling](https://www.mail-archive.com/jira@kafka.apache.org/msg149617.html): `NOT_ENOUGH_REPLICAS` / `REQUEST_TIMED_OUT` are returned to clients as `COORDINATOR_NOT_AVAILABLE`
- [Confluent for Kubernetes: recover a multi-region KRaft cluster from quorum loss](https://docs.confluent.io/operator/current/co-disaster-recovery.html): recovery creates a new metadata timeline. If the failed region's controllers return during recovery and can reach each other, they form a second, competing quorum (split brain)
- [Confluent multi-datacenter architectures](https://docs.confluent.io/platform/current/multi-dc-deployments/multi-region-architectures.html): the 2.5 DC layout keeps the controller quorum through any single DC failure
- [Aiven-Open/kraft-last-standing](https://github.com/Aiven-Open/kraft-last-standing): shrinking a lost quorum to one surviving voter locks in data loss
- [Apache Kafka broker configs](https://kafka.apache.org/41/configuration/broker-configs/), [configuration reference](https://kafka.apache.org/43/generated/kafka_config.html) and [KRaft operations](https://kafka.apache.org/38/operations/kraft/)

## License

No license is included yet. Add one (for example MIT or Apache-2.0) before publishing if you want others to reuse the page.
