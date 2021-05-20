const _ = require('lodash');
const admin = require('firebase-admin');

module.exports = () => ({
  db: null,

  initialize() {
    const serviceAccount = sgApp.config.get('database.connections');

    admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccount.default.settings.serviceAccount
      ),
    });

    this.db = admin.firestore();
    return this;
  },

  parseSnapshots(snapshots) {
    const data = [];
    snapshots.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  },

  find(collection, query = {}) {
    const { conditions, operators, order, limit } = query;
    let ref = this.db.collection(collection);

    if (!_.isEmpty(conditions)) {
      const keys = Object.keys(conditions);
      keys.forEach((key) => {
        const o = (operators && operators[key]) || '==';
        ref = ref.where(key, o, conditions[key]);
      });
    }
    if (order) {
      ref = ref.orderBy(order.k, order.v);
    }
    if (limit) {
      ref = ref.limit(limit);
    }

    return ref.get().then(this.parseSnapshots);
  },

  findOne(collection, id) {
    return this.db
      .collection(collection)
      .doc(id)
      .get()
      .then((snapshot) => snapshot.data());
  },

  create(collection, data, id) {
    const c = this.db.collection(collection);
    const ref = c.doc(id);
    return ref.set(data);
  },

  update(collection, data, id) {
    const c = this.db.collection(collection);
    const ref = c.doc(id);
    return ref.set(data, { merge: true });
  },

  delete(collection, id) {
    return this.db.collection(collection).doc(id).delete();
  },
});
