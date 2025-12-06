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

(assert (= s (set.union s (as set.empty (FiniteSet Int))))
(check-sat)
```

**Graph coloring example**
```
(define-const colors (FiniteSet Int) (set.range 1 3))

(declare-const v1 Int)
(declare-const v2 Int)
(declare-const v3 Int)

(assert (set.in v1 colors))
(assert (set.in v2 colors))
(assert (set.in v3 colors))

; adjacent vertices differ
(assert (not (= v1 v2)))
(assert (not (= v2 v3)))
(assert (not (= v1 v3)))

(check-sat)
```

**Advent of code day 5**
```
(declare-const s (FiniteSet Int))

(assert (not (set.subset (set.range 3 5) s)))
(assert (not (set.subset (set.range 10 14) s)))
(assert (not (set.subset (set.range 16 20) s)))
(assert (not (set.subset (set.range 12 18) s)))

(assert (not (set.in 5 s)))
(assert (not (set.in 11 s)))
(assert (not (set.in 17 s)))

(check-sat)
```

**Find two disjoint teams**
```
(declare-const team-A (FiniteSet Int))
(declare-const team-B (FiniteSet Int))
(define-const people (FiniteSet Int) (set.range 1 10))

; both teams from same pool
(assert (set.subset team-A people))
(assert (set.subset team-B people))

; no overlap
(assert (= (set.intersect team-A team-B) (as set.empty (FiniteSet Int))))

; team sizes
(assert (= (set.size team-A:set) 3))
(assert (= (set.size team-B:set) 4))

(check-sat)
```
