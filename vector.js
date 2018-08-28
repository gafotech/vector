const
  stemmer = require('stemmer'),
  commonWords = require('stopwords-en');

function Vector() {

  this.globalTermFrequency = {};
  this.globalDocFrequency = {};
  this.globalDocCount = 0;

  /**
   * stemAndTokenize - description
   *
   * @param  {type} text description
   * @return {type}      description
   */
  this.stemAndTokenize = (text) => {
    if (!text) return [];
    var cwords = commonWords.join(' ');
    //var stemCommon = natural.PorterStemmer.tokenizeAndStem(cwords);
    var stemCommon = commonWords.map(x => stemmer(x.toLowerCase()))


    var letters = /^[A-Za-z]+$/;
    var filtered = [];
    //var tokens = natural.PorterStemmer.tokenizeAndStem(text);
    var tokens = text.split(/(\s+)/).map(x => stemmer(x.toLowerCase()));
    for (var t in tokens) {
      // if alpha letters and not a common word, add
      if (t && tokens[t] && tokens[t].match(letters) && stemCommon.indexOf(tokens[t]) < 0) {
        filtered.push(tokens[t]);
      }
    }
    return filtered;
  };

  this.updateGlobal = (tf) => {
    for (var t in tf) {
      if (t in this.globalTermFrequency) {
        this.globalTermFrequency[t] += tf[t];
        this.globalDocFrequency[t] += 1;
      } else {
        this.globalTermFrequency[t] = tf[t];
        this.globalDocFrequency[t] = 1;
      }
    }
    this.globalDocCount++;
    return true;
  }

  /**
   * computeTermFrequency - description
   *
   * @param  {type} text description
   * @return {type}      description
   */
  this.computeTermFrequency = (text, updateGlobal) => {
    var tf = {};
    var tokens = this.stemAndTokenize(text);
    for (var i=0; i<tokens.length; i++) {
      var token = tokens[i];
      if (token in tf) tf[token] += 1;
      else tf[token] = 1;
    }
    for (var key in tf) {
      if (tf[key] < 1) {
        delete tf[key];
      }
    }
    if (updateGlobal) this.updateGlobal(tf);
    return tf;
  }

  this.computeTFIDF = (tf) => {
    var gdf = this.globalDocFrequency;
    var gtf = this.globalTermFrequency;
    var N = this.globalDocCount;
    var idf = {};
    for (var t in tf) {
      if (t in gdf) idf[t] = Math.log(1.0*N/parseFloat(gdf[t]));
    }
    var tfidf = idf;
    for (var t in idf) {
      tfidf[t] = parseFloat(tf[t]) * idf[t];
    }
    return tfidf;
  }

  /**
   * dot - compute dot product between two hashes
   *
   * @param  {Object} X first object mapping terms to term frequency
   * @param  {Object} Y second object mapping terms to term frequency
   * @return {Float}  the dot product of X and Y
   */
  this.dot = (X,Y) => {
    var result = 0;
    for (x in X) {
      if (x in Y) {
          if (X[x] && Y[x])
            result += parseFloat(X[x]) * parseFloat(Y[x])
      }
    }
    return result;
  }

  /**
   * norm - compute the norm of a frequency vector
   *
   * @param  {Object} X frequenct vector
   * @return {Float}    the norm of X
   */
  this.norm = (X) => {
    return Math.sqrt(this.dot(X,X));
  }

  /**
   * cosineSimilarity - compute cosine similarity between two vectors
   *
   * @param  {Object} X first object mapping terms to term frequency
   * @param  {Object} Y second object mapping terms to term frequency
   * @return {Float}  the cosine similarity between X and Y
   */
  this.cosineSimilarity = (X, Y) => {
    var epsilon = 1.0/100000000;
    var sim = this.dot(X,Y) / ((this.norm(X) * this.norm(Y)) + epsilon);
    return sim;
  }

}

module.exports = Vector;
