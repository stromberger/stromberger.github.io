---
title: Squaring Fibonacci Numbers without Multiplication
author: Alexander Stromberger
---

I got an interesting exercise this semester in formal methods:

> Write [a program] that computes the square of Fibonacci numbers. ..., where fibSq is computed by p using only one loop. Moreover, your program p should not support multiplication, but only addition.

Initially this seems to be impossible - How can you square something without multiplying it? However fibonacci numbers have some intruiging properties - one of them being that they can be formulated as a reccurrence relation

$$F_n = F_{n-1} + F_{n-2}$$

where \\(F_0 = 0\\) and \\(F_1 = 1\\). A good first idea would be to square this relation to get

$$F_n^2 = (F_{n-1} + F_{n-2})^2 = F_{n-1}^2 + 2 F_{n-1} F_{n-2} + F_{n-2}^2$$

Well, the binomial forumla ruins the day again. There is now an additional factor that needs a multiplication (too bad that we are not in \\(\mathbb{Z}_2\\), where \\(a^2+b^2=(a+b)^2\\)). However it might still be possible to somehow cancel out this term, if we square the right \\(F_n\\)

$$F_{n}^2=(F_{n-1}-F_{n-2})^2$$
$$F_{n-3}^2=(F_{n-1}-F_{n-2})^2$$

Now if we add these terms together we get

$$
F_n^2 + F_{n-3}^2 = F_{n-1}^2 + 2F_{n-1}F_{n-2} + F_{n-2}^2 + F_{n-1}^2 - 2F_{n-1}F_{n-2} + 2F_{n-2}^2
$$

Which simplifies to

$$
F_n^2 + F_{n-3}^2 = 2F_{n-1}^2 + 2F_{n-2}^2 - F_{n-3}^2
$$

and with a bit of algebra we get that

$$
F_n^2 = 2F_{n-1}^2 + 2F_{n-2}^2 - 2F_{n-3}^2
$$

To use this recurrence without multiplication we just have to fix the three initial $F_n^2$ and we are done!