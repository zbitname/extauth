/**
 * Inmemory database
 *
 * @class Collection
 */
class Collection {
  /**
   * Creates an instance of Collection.
   *
   * @memberof Collection
   */
  constructor() {
    this.collection = [];
    this.id = 1;
  }

  /**
   * Insert any object to store
   *
   * @param {{}} data
   * @return {{}}
   * @memberof Collection
   */
  create(data) {
    const _data = Object.assign({}, data);

    if (!_data.id) {
      _data.id = this.id++;
    }

    this.collection.push(_data);

    return _data;
  }


  /**
   * Fetch an object from collection
   *
   * @param {{}} conditions
   * @return {{}}
   * @memberof Collection
   */
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
