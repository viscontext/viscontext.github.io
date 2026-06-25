import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

const projectId = "demo-viscontext";
let testEnvironment;

function submission(ownerId, status = "draft") {
  return {
    ownerId,
    status,
    frameworkVersion: "0.4.0",
    payload: { project: { title: "Rules test" }, context: {} },
    media: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

before(async () => {
  const [firestoreRules, storageRules] = await Promise.all([
    readFile(new URL("./firestore.rules", import.meta.url), "utf8"),
    readFile(new URL("./storage.rules", import.meta.url), "utf8"),
  ]);
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: firestoreRules },
    storage: { rules: storageRules },
  });
});

beforeEach(async () => {
  await Promise.all([
    testEnvironment.clearFirestore(),
    testEnvironment.clearStorage(),
  ]);
});

after(async () => {
  await testEnvironment.cleanup();
});

test("authors can create and read their own drafts", async () => {
  const author = testEnvironment.authenticatedContext("author-1");
  const draft = doc(author.firestore(), "submissions", "draft-1");

  await assertSucceeds(setDoc(draft, submission("author-1")));
  await assertSucceeds(getDoc(draft));
});

test("anonymous and other users cannot read an author's draft", async () => {
  const author = testEnvironment.authenticatedContext("author-1");
  const draft = doc(author.firestore(), "submissions", "draft-1");
  await assertSucceeds(setDoc(draft, submission("author-1")));

  const anonymousDraft = doc(
    testEnvironment.unauthenticatedContext().firestore(),
    "submissions",
    "draft-1",
  );
  const otherUserDraft = doc(
    testEnvironment.authenticatedContext("author-2").firestore(),
    "submissions",
    "draft-1",
  );
  await assertFails(getDoc(anonymousDraft));
  await assertFails(getDoc(otherUserDraft));
});

test("submitted records cannot be edited by their author", async () => {
  const author = testEnvironment.authenticatedContext("author-1");
  const draft = doc(author.firestore(), "submissions", "draft-1");
  await assertSucceeds(setDoc(draft, submission("author-1")));
  await assertSucceeds(updateDoc(draft, { status: "submitted", updatedAt: Timestamp.now() }));
  await assertFails(updateDoc(draft, { status: "draft", updatedAt: Timestamp.now() }));
});

test("storage accepts small author images and rejects unsafe uploads", async () => {
  const authorStorage = testEnvironment.authenticatedContext("author-1").storage();
  const otherStorage = testEnvironment.authenticatedContext("author-2").storage();
  const imagePath = "submissions/author-1/draft-1/preview.png";

  await assertSucceeds(
    uploadBytes(ref(authorStorage, imagePath), new Uint8Array([137, 80, 78, 71]), {
      contentType: "image/png",
    }),
  );
  await assertFails(
    uploadBytes(ref(otherStorage, imagePath), new Uint8Array([137, 80, 78, 71]), {
      contentType: "image/png",
    }),
  );
  await assertFails(
    uploadBytes(
      ref(authorStorage, "submissions/author-1/draft-1/script.svg"),
      new TextEncoder().encode("<svg><script /></svg>"),
      { contentType: "image/svg+xml" },
    ),
  );
  await assertFails(
    uploadBytes(ref(authorStorage, "submissions/author-1/draft-1/chart.png"), new Uint8Array([1]), {
      contentType: "image/png",
    }),
  );
  await assertFails(
    uploadBytes(
      ref(authorStorage, "submissions/author-1/draft-1/large.png"),
      new Uint8Array(5 * 1024 * 1024 + 1),
      { contentType: "image/png" },
    ),
  );
});
