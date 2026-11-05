# Kafka KRaft: two-DC network partition walkthrough

An interactive, animated page that walks through what happens to **one partition** when the network link between two data centers is cut, then restored, on a KRaft-based Apache Kafka cluster.

It shows step by step:

- which side keeps the **KRaft controller quorum**
- how the **isolated old leader** keeps accepting writes but can't commit them (its ISR can't shrink without the controller)
- **broker fencing** and the clean election of a new leader on the quorum side
- why `acks=all` requests time out and offset commits return `COORDINATOR_NOT_AVAILABLE`
- what happens at **heal**: `OffsetForLeaderEpoch`, **truncation** of the divergent suffix, and rejoining the ISR
- which client writes survive (`acks=all` + idempotence) and which are silently lost (`acks=0/1`)

A switch lets you place the **active controller** in DC-A (the majority side) or DC-B (the minority side). With DC-B, an extra controller-election step shows that the outcome is the same, just a few seconds later.

## View it

The page is a single self-contained `index.html`: no build step, no dependencies, no network calls.

- **Locally:** open `index.html` in a browser.
- **GitHub Pages (automatic deploy):** the repository includes `.github/workflows/pages.yml`.
  1. Push this folder to a repository with `main` as the default branch.
  2. Go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
  3. Every push to `main` (or a manual run from the **Actions** tab) publishes the page to `https://<user>.github.io/<repo>/`.

  The workflow publishes only `index.html`, not the README or the workflow files. If your default branch isn't `main`, change `branches: [main]` in the workflow.

Controls: **Back / Next** buttons, clickable step dots, **Play / Pause**, the **← →** arrow keys, and **◐** to switch between light and dark themes. Printing (or "Save as PDF") lists every step of the selected scenario.

## Repository layout

```
.
├── index.html                    # the interactive walkthrough
├── README.md
└── .github/workflows/pages.yml   # GitHub Pages deployment
```

## Assumptions

The scenario is illustrative, not a specific production layout:

- 4 brokers split 2 + 2 across DC-A and DC-B; 3 dedicated KRaft controllers split 2 (DC-A) + 1 (DC-B)
- one partition with replication factor 4, led by broker 3 (DC-B) at leader epoch 7 before the cut
- default timeouts: `broker.session.timeout.ms` 9 s, `replica.lag.time.max.ms` 30 s, `controller.quorum.fetch.timeout.ms` 2 s, `controller.quorum.election.timeout.ms` 1 s
- `min.insync.replicas` ≤ 2 and `unclean.leader.election.enable=false`
- offsets and timings are illustrative; measure the real timings in your own failover test

## Sources

- [KIP-497: Add inter-broker API to alter ISR](https://cwiki.apache.org/confluence/display/KAFKA/KIP-497:+Add+inter-broker+API+to+alter+ISR) and [apache/kafka PR #9100](https://github.com/apache/kafka/pull/9100): only the controller changes the ISR; the leader keeps the previous ("maximal") ISR until a shrink is confirmed
- [KIP-101](https://cwiki-test.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation) and [KIP-279](https://cwiki.apache.org/confluence/display/KAFKA/KIP-279:+Fix+log+divergence+between+leader+and+follower+after+fast+leader+fail+over): leader epochs, `OffsetForLeaderEpoch` and follower truncation
- [KIP-595: A Raft Protocol for the Metadata Quorum](https://cwiki.apache.org/confluence/x/Li7cC): metadata records are committed once a majority of voters has them
- [GroupCoordinatorService error handling](https://www.mail-archive.com/jira@kafka.apache.org/msg149617.html): `NOT_ENOUGH_REPLICAS` / `REQUEST_TIMED_OUT` are returned to clients as `COORDINATOR_NOT_AVAILABLE`
- [Apache Kafka broker configs](https://kafka.apache.org/41/configuration/broker-configs/), [configuration reference](https://kafka.apache.org/43/generated/kafka_config.html) and [KRaft operations](https://kafka.apache.org/38/operations/kraft/)

## License

No license is included yet. Add one (for example MIT or Apache-2.0) before publishing if you want others to reuse the page.
