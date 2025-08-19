---
title: Differentiable Programming using C++
author: Alexander Stromberger
date: 2025-08-19
---

_This essay was done as part of the Bjarne Stroustrup's Software Design with C++ course at Aarhus University._

## Introduction
In recent years, gradient-based optimization techniques have become an essential tool in machine learning and scientific computing: Their application range from training neural networks on large datasets [1] to optimizing beamline design for particle accelerators [2]. However, this approach also necessitates the efficient computation of gradients. The _differentiable programming_ paradigm offers software developers a solution to automatically derive gradients from code end to end without error-prone manual intervention [3]. This essay introduces the idea behind this paradigm and provides examples of how C++ language features can be used to facilitate this paradigm.

## What is differentiable programming?
Before we can give a good definition for differentiable programming, we should informally re-introduce (mathematical) derivatives: Derivatives show us the _rate of change_ of a (differentiable) function. This is quite helpful if we want to minimize (or maximize) a function with regard to one or multiple of its variables. It allows us to take small steps in the direction that minimizes the function (i.e., has a negative rate of change). This is called _gradient descent_ and used extensively in optimization and machine learning.
Differentiable programming is a programming paradigm that enables us to automatically obtain derivatives from existing code without manually specifying them. For example the function $f: \mathbb{R} \times \mathbb{R} \to \mathbb{R} \; (x,y) \mapsto x^2y$ implemented as
```cpp
double f(double x, double y) {
  return (x*x)*y;
}

```
would need approximately the following gradient implementation 
```cpp
vector<double> f_grad(double x, double y) {
  return vector {2 * x * y, x * x};
}
```
Implementing this manually can be pretty tedious and also error-prone. To alleviate the lives of software developers, a set of techniques called _automatic differentiation_ can be used. These allow us to evaluate partial derivatives without inaccuracies, which would happen if we differentiate numerically, and huge complexity, which would happen if we take the symbolic derivative. Automatic differentiation utilizes the fact that every elementary computation can be decomposed into a sequence of arithmetic operations and functions, where the derivative can be composed together via the chain rule of calculus.

## Automatic Differentiation
There are multiple ways to implement automatic differentiation, we generally make a distinction regarding the mode:
1. Forward mode: Traverses the chain rule from inside to outside.
2. Backward mode: Traverses the chain rule from outside to inside.

and the implementation type [4]:
1. Elemental: Mathematical operations are explicitly replaced by function calls provided by the AD library.
2. Operator-overloading: Custom data types combined with operator overloading are used to redefine mathematical operations to include derivative computation.
3. Source Code Transformation: The source code is transformed (within the same programming language) to include derivative computations.
4. Compiler-based: The compiler of the programming language is extended to include derivative computations.

Forward and backward modes have severely different runtimes depending on the number of input and output parameters. Generally, machine learning applications use backward mode automatic differentiation because they have a higher number of input parameters than output parameters. The implementation type also has a lot of influence over the performance, portability, and usability of automatic differentiation. For example, Enzyme [5], a compiler-based tool, is a plugin for LLVM and applies automatic differentiation after optimization, which showed significant speedups compared to doing automatic differentiation at the compiler frontend level. However, the compiler-based approach has the drawback that it isn't portable over different C++ compilers, and its implementation is quite complex. In this essay, we present a lightweight implementation of _forward mode_ automatic differentiation in C++ using _operator overloading_. This ensures that the implementation isn't dependent on a specific C++ compiler and can be used like a regular C++ library with minimal changes to existing code.

### Dual Numbers
One of the most common approaches for implementing forward mode automatic differentiation is to utilize dual numbers. Dual numbers are somewhat similar to complex numbers in the way that they extend a real number $a$ with an additional real number $b$ in the form $a+b\epsilon$, where $\epsilon$ satisfies $\epsilon^2=0$. We can now define arithmetic operations on duals similar to the operations on imaginary numbers: Addition and multiplication are defined as:

$$(a+b\epsilon)+(c+d\epsilon) = (a + c) + (b + d)\epsilon$$

$$(a+b\epsilon) \cdot (c+d\epsilon) = ac + (ad + bc)\epsilon + bd\epsilon^2 = ac + (ad + bc)\epsilon$$

The $\epsilon^2$ part in the multiplication definition vanishes due to $\epsilon^2=0$. 

This provides us now with an easy way to get the derivative without applying ordinary differentiation rules: We consider a scalar single-variable function $f: \mathbb{R} \to \mathbb{R}$. Instead of evaluating $f$ with a real number $a$ directly, we evaluate it with the dualized version $a+1\epsilon$. The output of this function will be another dual $c+d\epsilon$, where $c$ is the actual output and $d$ is the derivative of $f$ at $a$. 

### Dual Number Implementation

First of all, we have to define a new user-defined type `Dual` in C++. We don't want dual to be dependent on a concrete number type  like `float` or `double`, so we want to utilize genericity and templates:
```cpp
template <Arithmetic T>
class Dual {
public:
    T real;
    T dual;

    Dual() : real(0), dual(0) {}
    Dual(T r) : real(r), dual(0) {}
    Dual(T r, T d) : real(r), dual(d) {}

    ...
};
```
Essentially, `Dual` holds two elements of a type `T` that support arithmetic operations. For the sake of brevity, we are only considering addition and multiplication, but other operators can be easily extended. To ensure that `T` supports the needed operations and initializations, we introduce a self-defined concept `Arithmetic`:
```cpp
template <typename T>
concept Arithmetic = requires(T a, T b) {
    { a + b } -> std::convertible_to<T>;
    { a * b } -> std::convertible_to<T>;
    { T{0} };
    { T{1} }; 
};
```
We consider types that implement arithmetic operations like `int`, `float`, and `double` to fulfill the concept `Arithmetic`. Furthermore, this also allows us to not only use built-in number types but user-defined ones too (e.g., provided by arbitrary precision libraries like GMP [6]). This concept also allows us to define addition and multiplication via operator overloading on duals: 

```cpp
template <Arithmetic T>
class Dual {
public:
    ...
    Dual operator+(const Dual& other) const {
        return Dual(real + other.real, dual + other.dual);
    }

    Dual operator*(const Dual& other) const {
        return Dual(real * other.real, real * other.dual + dual * other.real);
    }
};
```


If we want to use the approach explained earlier to get the derivatives of arbitrary (scalar) C++ functions with minimal manual intervention, we only need to modify the function to accept arbitrary `Arithmetic` types. This allows us to evaluate them with duals. Using the function `f` from the beginning as an example, the modification would look like:

```cpp
template <Arithmetic Number>
Number f(Number x, Number y) {
    return (x*x)*y;
}
```
We can now calculate the partial derivative with respect to $x$ with
```cpp
Dual<double> x(2.0, 1.0);
Dual<double> y(2.0, 0.0);
auto pd = f(x, y);
cout << "Partial derivative of f at (2,2): " << pd.dual << std::endl;
```
Previously, we have only considered single-valued functions. However, in most real-world cases, we have functions with more than one variable. Each of these input variables has a corresponding partial derivative with respect to this input variable. We can "select" which variable we want to differentiate by setting the variables corresponding $\epsilon$ part to $1$. In many cases, we are interested in all the partial derivatives of a function $f$ at a given point; we call this (mathematical) vector the gradient of $f$ (denoted as $\nabla f$).

### $\nabla$ Implementation

It is pretty obvious how we could get the gradient of the function `f` above. However, this approach falls short when we consider functions with dozens of input variables. We want a way to automatically get the gradient of a function using our previously defined `Duals`.

The idea is to define a function `gradient` that takes an arbitrary function and a position, evaluates it using duals for every component in the position, and then returns a vector with the partial derivatives at this position. To achieve this, we can utilize templates, `constexpr`, and variadic functions:

```cpp
template<typename F, typename... Args>
auto gradient(F f, Args... args) {
    constexpr size_t N = sizeof...(args);
    using T = std::common_type_t<Args...>;

    std::vector<T> grad;
    std::vector<T> values = {T(args)...};
    grad.resize(N);

    for (size_t i = 0; i < N; i++) {
        std::array<Dual<T>, N> duals;
        for (size_t j = 0; j < N; j++) {
            duals[j] = Dual<T>(values[j], i == j ? T(1) : T(0));
        }
        grad[i] = std::apply(f, duals).dual;
    }
    
    return grad;
}
```
The function evaluates the function `f` $n$ times (where $n$ is the number of input arguments), whereby each iteration "selects" the $i$-th input argument to get the partial derivative. The results are then appended to the `vector` and returned.

The `gradient` function allows us now to calculate the gradient of `f` at $(2,2)$ quite easily with
```cpp
auto grad_f = gradient(f<Dual<double>>, 2.0, 2.0);
```

## Application: Gradient Descent
Gradient descent is an optimization technique where we can find a (local) extremum of a differentiable function by making small steps (_learning rate_) in the direction of the steepest ascent or descent. A simple pseudocode implementation is

```
repeat until convergence of x_t:
    x_{t+1} = x_t - α ∇f(x_t)
end
```

where $f$ is the function we want to minimize, $x_t$ denotes the position and $\alpha$ is the learning rate. 

A common benchmark example is to find the minimum of the Rosenbrock function. The function is defined as
$$r: \mathbb{R}^2 \to \mathbb{R} \; (x,y) \mapsto (a-x)^2+b(y-x^2)^2$$
and has a characteristic banana-like small valley that contains the minimum, which is notoriously hard to find. Usually, the parameters are set to $a=1$ and $b=100$. Implementing the Rosenbrock function in C++ in a way that is compatible with our dual numbers is rather straightforward:
```cpp
template <Arithmetic Number>
Number r(Number x, Number y) {
    Number a = Number(1);
    Number b = Number(100);
    return ((a - x) * (a - x)) + b * ((y - x * x) * (y - x * x));
}
```

We can now use the `r` function and implement the gradient descent algorithm introduced above using `grad`. For simplicity, we don't check for convergence but iterate till `max_iterations` and handle the two components explicitly.

```cpp
double x = 0.0;
double y = 1.0;
double learning_rate = 0.001;
int max_iterations = 100000;

std::cout << "Starting at (" << x << ", " << y << ")" << std::endl;
std::cout << "Initial value: " << r(x, y) << std::endl;

for (int i = 0; i < max_iterations; i++) {
    auto grad = gradient(r<Dual<double>>, x, y);

    x = x - learning_rate * grad[0];
    y = y - learning_rate * grad[1];
}

std::cout << "Position: (" << x << ", " << y << ")" << std::endl;
std::cout << "Final value: " << r(x, y) << std::endl;
```
Running the program above, we get the result:
```
Starting at (0, 1)
Initial value: 101
Position: (1, 1)
Final value: 5.19663e-27
```
The final position is the global optimum of the Rosenbrock function. The value there should be $0$ theoretically, but is slightly off due to numerical inaccuracies.

## Conclusion
We have introduced the concept of differentiable programming and explained how dual numbers can be used to implement forward mode automatic differentiation. Our simple C++ implementation shows how its language features can be used to implement this technique with minimal manual adaptation of existing code. We also explained how differentiable programming enables us to optimize functions via gradient descent and demonstrated how it is possible to find the optimum of the Rosenbrock function with it.

Overall, differentiable programming is an interesting technique that bridges traditional programming with mathematical optimization and allows us to get the derivative of arbitrary numerical functions. We hope that we have shown an interesting programming paradigm and how flexible modern C++ is to support such a programming style.

## Acknowledgments
This version of the essay was proofread and converted from Typst to Markdown with LLMs (Claude Sonnet 4).

## References

[1] Baydin, A., Pearlmutter, B., Radul, A., & Siskind, J. (2018). Automatic differentiation in machine learning: A survey. *Journal of Machine Learning Research*, 18.

[2] Gonzalez‑Aguilera, J., Kim, Y., Roussel, R., Edelen, A., & Mayes, C. (2023). Towards Fully Differentiable Accelerator Modeling. In *Proceedings of the 14th International Particle Accelerator Conference (IPAC'23)* (pp. 2797--2800). JACoW Publishing, Geneva, Switzerland.

[3] Blondel, M., & Roulet, V. (2024). The Elements of Differentiable Programming. *arXiv preprint arXiv:2403.14606*.

[4] Aehle, M., Blühdorn, J., Sagebaum, M., & Gauger, N. R. (2025). Forward-Mode Automatic Differentiation of Compiled Programs. *ACM Transactions on Mathematical Software*, 51(2), Article 7.

[5] Moses, W. S., & Churavy, V. (2020). Instead of rewriting foreign code for machine learning, automatically synthesize fast gradients. In *Proceedings of the 34th International Conference on Neural Information Processing Systems* (Article 1046). Curran Associates Inc.

[6] Granlund, T., & the GMP development team. (2012). *GNU MP: The GNU Multiple Precision Arithmetic Library* (5.0.5 ed.). Retrieved from http://gmplib.org/