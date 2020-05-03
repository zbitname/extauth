/**
 * Inmemory database
 *
 * @class Collection
 */
class Collection {
  public collection: any[] = [];
  public id = 1;

  /**
   * Insert any object to store
   *
   * @param {{}} data
   * @return {{}}
   * @memberof Collection
   */
  create(data: any) {
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
  findOne(conditions: any) {
    return this.collection.find(item => {
      return Object.keys(conditions).every(key => {
        return item[key] === conditions[key];
      });
    });
  }
}

const collections = {
  users: new Collection()
};

export const collection = (name: 'users') => {
  return collections[name];
};
