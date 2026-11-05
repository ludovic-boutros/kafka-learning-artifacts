/*
 * Artifact catalog: the single list the menu (index.html) is built from.
 *
 * To add an artifact:
 *   1. Put it in its own folder with an index.html, e.g. my-artifact/index.html
 *   2. Add an entry below. `path` is the folder name, relative to the repo root.
 *
 * Fields
 *   path         required  folder containing index.html (no leading "/", no "..")
 *   title        required  card title
 *   description  required  one or two sentences
 *   type         optional  e.g. "Interactive walkthrough", "Runbook", "Reference"
 *   tags         optional  list of short labels, used by the tag filter
 *   updated      optional  "YYYY-MM-DD"; the menu lists newest first
 *
 * The Pages workflow fails the build if an entry is malformed or its folder has
 * no index.html, and warns about folders with an index.html that are not listed.
 */
window.ARTIFACTS = [
  {
    path: "kafka-kraft-two-dc-partition",
    title: "Two-DC partition: isolated leader, failover and truncation",
    description: "Animated, step-by-step walkthrough of one partition on a KRaft cluster stretched over two data centers when the link is cut and restored: quorum, fencing, ISR, high watermark, truncation and which writes survive. Includes a split-brain scenario caused by a forced recovery.",
    type: "Interactive walkthrough",
    tags: ["Kafka", "KRaft", "Multi-DC", "Failure modes"],
    updated: "2026-11-05"
  }
];
