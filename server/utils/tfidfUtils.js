// utils/tfidfUtils.js
import natural from "natural";

const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
let qaData = [];

export function loadQA(data) {
  qaData = data;
  const questions = data.map(item => item.question);
  questions.forEach(q => tfidf.addDocument(q));
}

export function retrieveAnswer(userQuery) {
  let best = { score: 0, index: -1 };

  tfidf.tfidfs(userQuery, (i, score) => {
    if (score > best.score) {
      best = { score, index: i };
    }
  });

  return qaData[best.index]?.answer || "Désolé, je n'ai pas trouvé de réponse adaptée.";
}
