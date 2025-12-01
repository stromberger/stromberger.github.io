---
title: Z3 Finite Sets
author: Alexander Stromberger
date: 2025-12-01
---

**THIS PAGE IS WIP**

## SMT2 Operators

To declare a variable to be a `FiniteSet` of `S`:
```
(declare-const x (FiniteSet S))
```


| Operator | Input | Output | Definition |
|----------|-------|--------|------------|
| `set.empty` | — | `FiniteSet S` | $\emptyset$ |
| `set.singleton` | `S` | `FiniteSet S` | $\\{x\\}$ |
| `set.union` | `FiniteSet S`, `FiniteSet S` | `FiniteSet S` | $A \cup B$ |
| `set.intersect` | `FiniteSet S`, `FiniteSet S` | `FiniteSet S` | $A \cap B$ |
| `set.difference` | `FiniteSet S`, `FiniteSet S` | `FiniteSet S` | $A \setminus B$ |
| `set.in` | `S`, `FiniteSet S` | `Bool` | $x \in A$ |
| `set.size` | `FiniteSet S` | `Int` | $\|A\|$ |
| `set.subset` | `FiniteSet S`, `FiniteSet S` | `Bool` | $A \subseteq B$ |
| `set.map` | `S -> T`, `FiniteSet S` | `FiniteSet T` | $\\{f(x) \mid x \in A\\}$ |
| `set.filter` | `S -> Bool`, `FiniteSet S` | `FiniteSet S` | $\\{x \in A \mid p(x)\\}$ |
| `set.range` | `Int`, `Int` | `FiniteSet Int` | $\\{i \mid a \leq i \leq b\\}$ |
| `set.diff` | `FiniteSet S`, `FiniteSet S` | `S` | $A \triangle B$ |

For more details see `/src/ast/finite_set_decl_plugin.h`.

## Examples

**Assert that the union with the empty set is equal to the set itself**
```
(declare-const s (FiniteSet Int))

(assert (= s (set.union s (empty-set)))
(check-sat)
```