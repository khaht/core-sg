const {
  isScalarAttribute,
  isMediaAttribute,
  getPrivateAttributes,
  getTimestampsAttributes,
  isPrivateAttribute,
  getNonWritableAttributes,
  getWritableAttributes,
  getNonVisibleAttributes,
  getVisibleAttributes,
  hasDraftAndPublish,
  isDraft,
  isSingleType,
  isCollectionType,
  isKind,
} = require('../content-types.util');
const _ = require('lodash');

describe('Content types util', () => {
  test('Should is scalar attribute', () => {
    const attribute = {
      type: 'test',
    };

    expect(isScalarAttribute(attribute)).toBe(true);
  });

  test('Should is not scalar attribute', () => {
    const attribute = {
      collection: jest.fn(),
      model: jest.fn(),
      type: 'component',
    };
    expect(isScalarAttribute(attribute)).toBe(false);
  });

  describe('Media attribute', () => {
    test('Should is media attribute when collection is file', () => {
      const attribute = {
        collection: 'file',
        plugin: 'upload',
      };
      expect(isMediaAttribute(attribute)).toBeTruthy();
    });

    test('Should is media attribute when model is file', () => {
      const attribute = {
        model: 'file',
        plugin: 'upload',
      };
      expect(isMediaAttribute(attribute)).toBeTruthy();
    });

    test('Should is not media attribute', () => {
      const attribute = {
        model: 'text',
        plugin: 'upload',
      };
      expect(isMediaAttribute(attribute)).toBeFalsy();
    });
  });

  test('Should get private attributes', () => {
    const model = {
      attributes: { password: { private: true } },
      options: { privateAttributes: [] },
    };
    const config = {
      api: {
        responses: {
          privateAttributes: [],
        },
      },
    };

    global.sgApp = {
      config: {
        ...config,

        get(path, defaultValue) {
          return _.get(config, path, defaultValue);
        },

        set(path, val) {
          _.set(config, path, val);

          return this;
        },

        has(path) {
          return _.has(config, path);
        },
      },
    };
    const resp = getPrivateAttributes(model);
    expect(resp).toEqual(['password']);
  });

  test('Should get timestamps attributes', () => {
    expect(getTimestampsAttributes()).toEqual({});
    expect(
      getTimestampsAttributes({
        options: {
          timestamps: {},
        },
      })
    ).toEqual({});
    expect(
      getTimestampsAttributes({
        options: {
          timestamps: ['test'],
        },
      })
    ).toEqual({ test: { type: 'timestamp' } });
  });

  describe('Is Private Attribute', () => {
    test('Should is private attribute', () => {
      expect(
        isPrivateAttribute(
          {
            privateAttributes: ['att'],
          },
          'att'
        )
      ).toEqual(true);
    });

    test('Should is not private attribute when model is empty', () => {
      expect(isPrivateAttribute()).toBeFalsy();
    });
  });

  test('Should get non writable attributes', () => {
    expect(getNonWritableAttributes()).toEqual([
      'id',
      'created_by',
      'updated_by',
      undefined,
    ]);
    expect(
      getNonWritableAttributes({
        attributes: {
          test: {
            writable: false,
          },
          test1: {
            writable: true,
          },
        },
      })
    ).toEqual(['id', 'created_by', 'updated_by', undefined, 'test']);
  });

  test('Should get writable attributes', () => {
    expect(
      getWritableAttributes({
        attributes: {
          test: {
            writable: false,
          },
        },
      })
    ).toEqual([]);
  });

  describe('Non visible attributes', () => {
    test('Should get non visible attributes', () => {
      expect(
        getNonVisibleAttributes({
          attributes: { test: { writable: false } },
          primary: 'abc',
        })
      ).toEqual([undefined, 'id', 'created_by', 'updated_by', 'published_at']);
    });
  });

  describe('Visible attributes', () => {
    test('Should get visible attributes', () => {
      expect(
        getVisibleAttributes({
          attributes: { test: { writable: false } },
          primary: 'abc',
        })
      ).toEqual(['test']);
    });
  });

  describe('Draft and publish', () => {
    test('Should has draft and publish', () => {
      expect(
        hasDraftAndPublish({ options: { draftAndPublish: true } })
      ).toEqual(true);
    });

    test('Should has not draft and publish', () => {
      expect(
        hasDraftAndPublish({ options: { draftAndPublish: false } })
      ).toEqual(false);
    });
  });

  describe('Draft', () => {
    test('Should is draft', () => {
      expect(
        isDraft({ published_at: null }, { options: { draftAndPublish: true } })
      ).toEqual(true);
    });

    test('Should is not draft', () => {
      expect(
        isDraft({ published_at: null }, { options: { draftAndPublish: false } })
      ).toEqual(false);
    });
  });

  describe('Single type', () => {
    test('Should is single type', () => {
      expect(isSingleType({ kind: 'singleType' })).toBeTruthy();
    });

    test('Should is not single type', () => {
      expect(isSingleType({ kind: 'test' })).toBeFalsy();
    });

    test('Should is not single type with default kind', () => {
      expect(isSingleType({})).toBeFalsy();
    });
  });

  describe('Collection type', () => {
    test('Should is collection type', () => {
      expect(isCollectionType({ kind: 'collectionType' })).toBeTruthy();
    });

    test('Should is not collection type', () => {
      expect(isCollectionType({ kind: 'test' })).toBeFalsy();
    });

    test('Should is collection type with default kind', () => {
      expect(isCollectionType({})).toBeTruthy();
    });
  });

  describe('Kind', () => {
    test('Should is kind', () => {
      expect(isKind('test')({ kind: 'test' })).toEqual(true);
    });

    test('Should is not kind', () => {
      expect(isKind('test')({ kind: 'test1' })).toEqual(false);
    });
  });
});
