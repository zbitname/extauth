class Collection {
  constructor() {
    this.collection = [];
    this.id = 1;
  }

  create(data) {
    const _data = Object.assign({}, data);

    if (!_data.id) {
      _data.id = this.id++;
    }

    this.collection.push(_data);

    return _data;
  }

  findOne(conditions) {
    return this.collection.find(item => {
      return Object.keys(conditions).every(key => {
        return item[key] === conditions[key];
      });
    });
  }
}

const collections = {};
collections.users = new Collection();

module.exports = {
  collection(name) {
    return collections[name];
  }
};
