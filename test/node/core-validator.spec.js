'use strict'

/*
* indicative
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'

import validator from '../../src/core/validator'
import { required, integer, alpha, alphaNumeric } from '../../src/validations'
import * as formatters from '../../src/formatters'

const validationsHash = { required, integer, alpha, alphaNumeric }

test.group('Validator - Core', () => {
  test('throw exception when initiated without validations', async (assert) => {
    const fn = () => validator()
    assert.throw(fn, 'Cannot instantiate validator without validations')
  })

  test('throw exception when initiated without default formatter', async (assert) => {
    const fn = () => validator(validationsHash)
    assert.throw(fn, 'Cannot instantiate validator without error formatter')
  })

  test('run validations on data', async (assert) => {
    assert.plan(1)

    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {}
    const rules = {
      username: 'required'
    }

    try {
      await validate(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'required',
          field: 'username',
          message: 'required validation failed on username'
        }
      ])
    }
  })

  test('stop validations after first failure', async (assert) => {
    assert.plan(1)

    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {}
    const rules = {
      username: 'required',
      email: 'required'
    }

    try {
      await validate(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'required',
          field: 'username',
          message: 'required validation failed on username'
        }
      ])
    }
  })

  test('run all validations', async (assert) => {
    assert.plan(1)

    const { validateAll } = validator(validationsHash, formatters.Vanilla)
    const data = {}
    const rules = {
      username: 'required',
      email: 'required'
    }

    try {
      await validateAll(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'required',
          field: 'username',
          message: 'required validation failed on username'
        },
        {
          validation: 'required',
          field: 'email',
          message: 'required validation failed on email'
        }
      ])
    }
  })

  test('run multiple validations on one field', async (assert) => {
    assert.plan(1)

    const { validateAll } = validator(validationsHash, formatters.Vanilla)
    const data = { username: '$' }
    const rules = {
      username: 'alpha|alphaNumeric'
    }

    try {
      await validateAll(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'alpha',
          field: 'username',
          message: 'alpha validation failed on username'
        },
        {
          validation: 'alphaNumeric',
          field: 'username',
          message: 'alphaNumeric validation failed on username'
        }
      ])
    }
  })

  test('run one validation from multiple validations on one field', async (assert) => {
    assert.plan(1)

    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {}
    const rules = {
      age: 'required|integer'
    }

    try {
      await validate(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'required',
          field: 'age',
          message: 'required validation failed on age'
        }
      ])
    }
  })

  test('return original data when validation passes', async (assert) => {
    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {
      age: 22
    }
    const rules = {
      age: 'required'
    }

    const response = await validate(data, rules)
    assert.deepEqual(response, data)
  })

  test('throw engine exception when validation doesn\'t exists', async (assert) => {
    assert.plan(1)

    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {
      age: 22
    }
    const rules = {
      age: 'foo'
    }

    try {
      await validate(data, rules)
    } catch (errors) {
      assert.deepEqual(errors, [
        {
          validation: 'ENGINE_EXCEPTION',
          field: 'age',
          message: 'foo is not defined as a validation rule'
        }
      ])
    }
  })

  test('camelcase rules names', async (assert) => {
    const { validate } = validator(validationsHash, formatters.Vanilla)
    const data = {
      username: 'foo123'
    }
    const rules = {
      age: 'alpha_numeric'
    }

    const response = await validate(data, rules)
    assert.deepEqual(response, data)
  })
})
