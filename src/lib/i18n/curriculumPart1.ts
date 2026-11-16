import { CurriculumLesson } from './curriculumTypes';

export const curriculumLessonsPart1: CurriculumLesson[] = [
  {
    slug: 'hello-ferris',
    order: 1,
    phaseKey: 'phase1',
    difficultyKey: 'beginner',
    iconKey: 'sparkles',
    nextSlug: 'primitives-mutability',
    translations: {
      zh: {
        title: '你好 Ferris 与 Cargo 基础',
        shortTitle: '1. 你好 Ferris 与 Cargo',
        phase: '第一阶段：基础入门',
        difficulty: '初级',
        duration: '15 分钟',
        summary: '认识 Rust 工具链生态、Cargo 构建与测试命令、rustfmt 格式化规范，并编写你的第一个 main() 程序。',
        tags: ['Cargo', 'CLI', '基础语法'],
        overview:
          'Cargo 是 Rust 官方的构建系统与包管理器（crate 管理器）。在本节中，你将学习 Cargo 如何统一管理依赖、编译调试与发布版本二进制文件，以及为什么 Rust 通过显式的 main() 入口和宏系统兼顾安全与零开销抽象。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '与 C/C++ 需要手动维护 Makefile 或 CMake 不同，Rust 开箱即用提供 rustup（工具链管理器）、Rust 编译器与 cargo（项目构建器）。每个 Rust 项目都由根目录的 Cargo.toml 清单文件描述，其中记录包名、版本、Edition（如 2021/2024）以及 crates.io 依赖。',
            bullets: [
              'cargo new hello_ferris 一键生成标准的 src/main.rs 与 Cargo.toml 目录结构',
              'cargo check 只执行类型检查与借用检查，不生成机器码，日常开发速度极快',
              'println! 末尾的感叹号 ! 表示它是一个 Rust 宏（Macro），在编译期展开并检查格式化参数类型',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              'Rust 是预编译静态类型语言（AOT），编译产物直接面向原生机器码，无需虚拟机或垃圾回收器（GC）。使用 cargo build --release 时，LLVM 后端会开启 LTO 与激进内联优化，去除调试符号以实现极致的运行时性能。',
            bullets: [
              'main() 是可执行二进制 Crate 的唯一入口函数，无返回值（隐式返回单元类型 ()）',
              '字符串字面量（如 "Rustacean"）直接编译进只读静态数据段（.rodata），生命周期为整个程序运行期',
              'Cargo.lock 锁定精确依赖版本号，保证跨机器、跨团队构建完全可重现',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '在正式开发 Rust 项目时，建议尽早集成 clippy 与 rustfmt。它们被直接纳入官方工具链，能在编码阶段捕获数百种潜在逻辑缺陷并统一团队代码风格。',
            bullets: [
              '提交代码前运行 cargo fmt 检查并格式化全部源文件',
              '运行 cargo clippy 获取更地道（Idiomatic）的 Rust 写法建议',
              '开发阶段优先使用 cargo run / cargo test，上线部署切换至 cargo build --release',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // println! 是编译器内置宏，在编译期校验占位符 {} 与参数数量
    println!("Hello, Ferris! 🦀");

    // 绑定一个只读字符串切片 (&str)，指向静态只读内存
    let name = "Rustacean";
    let edition = 2024;

    println!("欢迎来到零开销、内存安全的系统编程世界，{} (Rust {})！", name, edition);
}`,
        codeExplanation: [
          '第 1 行：main() 函数声明程序主入口点，所有可执行二进制项目必须包含该入口。',
          '第 3 行：println!("Hello, Ferris! 🦀") 调用宏向标准输出打印字符串，UTF-8 原生支持 emoji 字符。',
          '第 6 行：let name = "Rustacean" 创建不可变绑定，类型为 &' + "static str（胖指针：指针 + 字节长度）。",
          '第 9 行：占位符 {} 通过 Display trait 安全格式化变量，编译器会在编译期校验参数数量是否匹配。',
        ],
        pitfall: {
          title: '误将宏当作普通函数调用（遗漏感叹号 !）',
          errorCode: 'error[E0423]: expected function, found macro `println`',
          badCode: `println("Hello, Ferris!"); // 缺少感叹号 !`,
          description:
            '在 Rust 中，println!、vec!、format! 属于宏而非函数。宏允许接受可变数量的参数并在编译期进行格式串检查；漏掉 ! 会让编译器把它当作不存在的普通函数。',
          fix: '在宏名称末尾始终加上感叹号：println!("Hello, Ferris!");，并注意使用双引号 "" 表示字符串（单引号仅用于单个 char）。',
        },
        quiz: {
          question: '在日常编码阶段，哪条 Cargo 命令可以在不生成最终可执行文件的情况下最快完成语法与借用检查？',
          options: [
            'cargo build --release',
            'cargo check',
            'cargo clean',
          ],
          correctIndex: 1,
          explanation:
            'cargo check 会跳过耗时的代码生成（Codegen）阶段，仅执行语法、类型推导与借用检查，是开发过程中验证代码能否编译的最快方式。',
          challengePrompt: '补全定义主入口函数的关键字：',
          challengePrefix: '',
          challengeKeyword: 'fn',
          challengeSuffix: ' main() { println!("Hello, Ferris!"); }',
          challengeSuccess: '回答正确！fn 关键字用于在 Rust 中声明函数。',
        },
      },
      en: {
        title: 'Hello Ferris & Cargo Basics',
        shortTitle: '1. Hello Ferris & Cargo',
        phase: 'Phase 1: Foundations',
        difficulty: 'Beginner',
        duration: '15 min',
        summary: 'Discover the Rust ecosystem, Cargo build commands, formatting with rustfmt, and writing your first main().',
        tags: ['Cargo', 'CLI', 'Syntax'],
        overview:
          'Cargo is the official Rust build system and package manager. In this module, you learn how Cargo manages dependencies, compiles debug and release binaries, and why Rust enforces explicit main() entry points alongside compile-time checked macros.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Unlike C/C++ toolchains that rely on fragmented Makefiles or CMake scripts, Rust ships with a unified workflow: rustup (toolchain manager), the Rust compiler, and cargo (build orchestrator). Every package is described by a declarative Cargo.toml manifest.',
            bullets: [
              'cargo new creates a standardized src/main.rs layout and Cargo.toml manifest immediately',
              'cargo check verifies types and borrow rules without emitting machine code for rapid feedback',
              'The trailing ! on println! marks a Rust macro expanded and type-checked at compile time',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Rust compiles ahead-of-time (AOT) directly to native machine code without a virtual machine or garbage collector. Running cargo build --release enables LLVM optimization passes and strips debug overhead for maximum throughput.',
            bullets: [
              'main() serves as the entry point for binary crates and implicitly returns the unit type ()',
              'String literals like "Rustacean" reside in read-only static binary memory (.rodata)',
              'Cargo.lock pins exact dependency versions to guarantee reproducible builds across environments',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Adopt official linting and formatting tools early. Both rustfmt and clippy ship directly via rustup, enforcing consistent style and catching subtle anti-patterns before code review.',
            bullets: [
              'Run cargo fmt before commits to keep formatting standardized across contributors',
              'Run cargo clippy to receive idiomatic Rust suggestions and catch redundant allocations',
              'Use cargo run for quick local iteration and cargo test for built-in unit/integration suites',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // println! is a macro checked at compile time for valid format arguments
    println!("Hello, Ferris! 🦀");

    // Bind an immutable string slice (&str) pointing to static read-only memory
    let name = "Rustacean";
    let edition = 2024;

    println!("Welcome to memory-safe systems programming, {} (Rust {})!", name, edition);
}`,
        codeExplanation: [
          'Line 1: main() defines the executable entry point required by every binary crate.',
          'Line 3: println!("Hello, Ferris! 🦀") invokes the print macro with native UTF-8 Unicode support.',
          'Line 6: let name = "Rustacean" binds a &' + "static str fat pointer (address + byte length).",
          'Line 9: Placeholders {} safely format values via the Display trait, verified at compile time.',
        ],
        pitfall: {
          title: 'Calling a macro like a regular function (missing !)',
          errorCode: 'error[E0423]: expected function, found macro `println`',
          badCode: `println("Hello, Ferris!"); // Missing exclamation mark !`,
          description:
            'In Rust, println!, vec!, and format! are macros rather than ordinary functions, allowing variadic arguments and compile-time format validation. Omitting ! causes the Rust compiler to look for a non-existent function.',
          fix: 'Always append ! when invoking a macro: println!("Hello, Ferris!");, and use double quotes "" for strings.',
        },
        quiz: {
          question: 'Which Cargo command performs full type and borrow checking fastest without producing a binary executable?',
          options: [
            'cargo build --release',
            'cargo check',
            'cargo clean',
          ],
          correctIndex: 1,
          explanation:
            'cargo check skips LLVM machine code generation while running full syntax, type, and borrow-checker verification, giving the fastest feedback loop.',
          challengePrompt: 'Fill in the Rust keyword used to declare the main function:',
          challengePrefix: '',
          challengeKeyword: 'fn',
          challengeSuffix: ' main() { println!("Hello, Ferris!"); }',
          challengeSuccess: 'Valid Rust syntax! `fn` declares functions in Rust.',
        },
      },
      ja: {
        title: 'Hello Ferris と Cargo の基本',
        shortTitle: '1. Hello Ferris と Cargo',
        phase: 'フェーズ 1：基礎固め',
        difficulty: '初級',
        duration: '15 分',
        summary: 'Rust エコシステム、Cargo のビルドコマンド、rustfmt による整形、そして最初の main() を学びます。',
        tags: ['Cargo', 'CLI', '基本構文'],
        overview:
          'Cargo は Rust 公式のビルドシステム兼パッケージマネージャです。このモジュールでは、Cargo が依存関係をどのように管理し、デバッグビルドやリリースバイナリを生成するか、そして Rust が明示的な main() を採用する理由を学びます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'C/C++ のように Makefile や CMake を手動管理する必要はなく、Rust は rustup（ツールチェイン管理）、Rust コンパイラ、cargo（ビルド管理）を標準提供します。すべてのプロジェクトは Cargo.toml マニフェストで定義されます。',
            bullets: [
              'cargo new で標準的な src/main.rs と Cargo.toml の構成を瞬時に生成',
              'cargo check はバイナリ生成を省いて型チェックと借用チェックだけを高速に実行',
              'println! 末尾の ! はマクロ（Macro）であることを示し、コンパイル時に書式文字列を検証',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              'Rust は仮想マシンやガベージコレクタを持たない AOT（事前コンパイル）言語で、ネイティブ機械語を直接出力します。cargo build --release を実行すると LLVM が高度な最適化を行います。',
            bullets: [
              'main() は実行可能バイナリの唯一のエントリポイントで、ユニット型 () を返します',
              '"Rustacean" のような文字列リテラルは読み取り専用の静的メモリ領域（.rodata）に配置されます',
              'Cargo.lock により依存クレートのバージョンが厳密に固定され、再現性の高いビルドを実現します',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '開発初期から公式のフォーマッタ（rustfmt）とリンター（clippy）を活用しましょう。これによりコードスタイルが統一され、潜在的なバグや非効率な書き方を即座に検出できます。',
            bullets: [
              'コミット前に cargo fmt を実行して全ファイルのインデントや空白を自動整形',
              'cargo clippy でより Rust らしいイディオムや不要なアロケーションを検出',
              '開発中は cargo run / cargo test、本番配信時は cargo build --release を使用',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // println! はコンパイル時に書式引数チェックが行われる組み込みマクロ
    println!("Hello, Ferris! 🦀");

    // 静的メモリ上の文字列スライス (&str) へ不変束縛を作成
    let name = "Rustacean";
    let edition = 2024;

    println!("メモリ安全なシステムプログラミングへようこそ、{} (Rust {})！", name, edition);
}`,
        codeExplanation: [
          '1 行目：main() はバイナリクレートの開始地点となるエントリポイントです。',
          '3 行目：println!("Hello, Ferris! 🦀") は UTF-8 ネイティブ対応のマクロで標準出力へ表示します。',
          '6 行目：let name = "Rustacean" は静的読み取り専用領域を指す &' + "static str ファットポインタを束縛します。",
          '9 行目：プレースホルダ {} は Display トレイトを通じて型安全に展開されます。',
        ],
        pitfall: {
          title: 'マクロを通常の関数として呼び出してしまう（! の付け忘れ）',
          errorCode: 'error[E0423]: expected function, found macro `println`',
          badCode: `println("Hello, Ferris!"); // 感嘆符 ! が抜けている`,
          description:
            'println! や vec! は関数ではなくマクロであり、可変長引数とコンパイル時検証を可能にします。! を忘れるとコンパイラは未定義の関数を探してエラーを出します。',
          fix: 'マクロ呼び出しには必ず末尾に ! を付けます：println!("Hello, Ferris!");。文字列には二重引用符 "" を使用してください。',
        },
        quiz: {
          question: '実行ファイルを生成せずに、型チェックと借用チェックを最も高速に実行できる Cargo コマンドはどれですか？',
          options: [
            'cargo build --release',
            'cargo check',
            'cargo clean',
          ],
          correctIndex: 1,
          explanation:
            'cargo check は時間がかかる機械語生成（Codegen）フェーズをスキップし、構文・型推論・借用チェックのみを行うため最も高速です。',
          challengePrompt: '関数を宣言するための Rust キーワードを入力してください：',
          challengePrefix: '',
          challengeKeyword: 'fn',
          challengeSuffix: ' main() { println!("Hello, Ferris!"); }',
          challengeSuccess: '正解です！`fn` キーワードで Rust の関数を宣言します。',
        },
      },
    },
  },
  {
    slug: 'primitives-mutability',
    order: 2,
    phaseKey: 'phase1',
    difficultyKey: 'beginner',
    iconKey: 'boxes',
    prevSlug: 'hello-ferris',
    nextSlug: 'ownership-move',
    translations: {
      zh: {
        title: '基本数据类型与可变性',
        shortTitle: '2. 基本类型与可变性',
        phase: '第一阶段：基础入门',
        difficulty: '初级',
        duration: '20 分钟',
        summary: '掌握默认不可变绑定（let）、显式可变绑定（let mut）、变量遮蔽（Shadowing），以及标量与复合类型的内存表现。',
        tags: ['类型系统', '内存对齐', '变量绑定'],
        overview:
          '在 Rust 中，所有变量默认都是不可变的（Immutable）。若要修改绑定值，必须显式声明 let mut。这种“默认安全”的哲学配合强大的静态标量类型（i32/u64/f64/bool/char）与复合类型（元组、定长数组），让你在编码瞬间看清数据如何存放在栈帧上。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '默认不可变性迫使开发者明确哪些状态会发生变化，大幅降低并发与状态流转中的意外 Bug。若需要在不修改原绑定可变性的前提下转换类型，Rust 还提供了独特的变量遮蔽（Shadowing）机制。',
            bullets: [
              'let x = 5 默认只读；尝试重新赋值会触发编译器错误 E0384',
              'let mut count = 42 显式声明可变绑定，允许原地修改栈内存值',
              'Shadowing（再次 let x = ...）允许改变变量类型，例如将字符串 "42" 转为整数 42',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              'Rust 的标量与固定长度复合类型全部实现了 Copy trait，大小在编译期完全已知（Sized），因此直接分配在速度极快的调用栈（Stack）上，赋值时按位复制，不涉及堆分配。',
            bullets: [
              '整数默认推导为 i32，浮点默认为 f64；调试模式下整数溢出会直接 panic 避免静默数据损坏',
              'Rust 的 char 类型占 4 字节（32 位 Unicode 标量值），能直接存储汉字与 Emoji',
              '定长数组 [T; N] 连续存储在栈上，运行时下标访问会自动执行边界检查防止缓冲区溢出',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '清晰区分 const 常量与不可变 let 绑定，并善用类型后缀与下划线分隔符提高数值代码的可读性。',
            bullets: [
              'const MAX_CONN: u32 = 10_000 必须在编译期求值且必须显式标注类型',
              '优先保持绑定不可变，仅在确实需要原地累积或修改时才添加 mut',
              '使用 checked_add / saturating_add 显式处理算术溢出边界场景',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // 默认不可变绑定，再使用 Shadowing 转换类型
    let spaces = "   ";
    let spaces = spaces.len(); // 类型由 &str 遮蔽为 usize

    // 显式使用 let mut 声明可变计数器
    let mut count: i32 = 42;
    println!("初始计数: {}, 空格数: {}", count, spaces);
    count += 1;

    // 复合类型：元组 (Tuple) 与定长数组 (Array) 均分配在栈上
    let point: (f64, f64) = (3.14, 2.71);
    let scores: [u8; 3] = [90, 95, 100];
    println!("递增后: {}, 坐标: {:?}, 最高分: {}", count, point, scores[2]);
}`,
        codeExplanation: [
          '第 3-4 行：变量遮蔽（Shadowing）重新绑定同名变量 spaces，并把类型从 &str 变为 usize。',
          '第 7 行：let mut count: i32 = 42 在栈上分配 4 字节有符号整数并开启写权限。',
          '第 12 行：元组允许混合不同类型字段，在栈上紧凑排列。',
          '第 13 行：数组 [u8; 3] 仅占 3 字节连续栈空间，访问越界会在运行时安全触发 panic。',
        ],
        pitfall: {
          title: '尝试修改未声明 mut 的不可变变量',
          errorCode: 'error[E0384]: cannot assign twice to immutable variable `count`',
          badCode: `let count = 42;
count = 43; // 编译失败：不可变变量不能二次赋值`,
          description:
            '新手常忘记在需要重新赋值的变量前加 mut。Rust 默认关闭写权限，防止在大型函数中无意修改共享状态。',
          fix: '如果确实需要原地修改该变量，请将声明改为 let mut count = 42;；如果只是想基于旧值生成新值，可使用 let count = count + 1; 进行变量遮蔽。',
        },
        quiz: {
          question: '以下关于 Rust 变量绑定与 Shadowing（遮蔽）的描述，哪一项是正确的？',
          options: [
            'let mut 允许在原地直接将变量的类型从 String 变为 i32。',
            '使用 let 再次声明同名变量（Shadowing）可以改变变量的类型，同时保持新绑定默认不可变。',
            'const 常量可以使用 mut 关键字使其在运行时可变。',
          ],
          correctIndex: 1,
          explanation:
            'let mut 只能修改同一类型的值；而 Shadowing（再次使用 let）本质上创建了一个全新的同名绑定，因此可以更换数据类型且保持默认不可变。',
          challengePrompt: '填入关键字使变量 count 变为可修改（可变）状态：',
          challengePrefix: 'let ',
          challengeKeyword: 'mut',
          challengeSuffix: ' count = 0;',
          challengeSuccess: 'Syntax 验证通过！`mut` 赋予变量绑定可变写权限。',
        },
      },
      en: {
        title: 'Primitive Types & Mutability',
        shortTitle: '2. Primitives & Mutability',
        phase: 'Phase 1: Foundations',
        difficulty: 'Beginner',
        duration: '20 min',
        summary: 'Master immutable variables by default (let), mutable binding (let mut), shadowing, scalar types, tuples, and arrays.',
        tags: ['Types', 'Memory', 'Variables'],
        overview:
          'In Rust, bindings are immutable by default. To mutate a variable in place, you must explicitly opt in using `let mut`. Combined with deterministic scalar types (i32, f64, bool, char) and stack-allocated compound types, Rust gives you exact control over memory layout.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Immutability by default eliminates accidental state mutation across large codebases. When you need to transform a value into another type without inventing awkward names like spaces_str and spaces_num, Rust provides variable shadowing.',
            bullets: [
              'let x = 5 is read-only; reassigning it triggers compiler error E0384',
              'let mut count = 42 explicitly grants write access to the stack slot',
              'Shadowing (let x = x.len()) creates a brand new binding that can even change type',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Rust scalar types and fixed-size arrays of Copy types have compile-time known sizes (Sized). They live directly on the CPU stack frame and copy bitwise with zero heap overhead.',
            bullets: [
              'Integers default to i32 and floats to f64; debug builds panic on integer overflow rather than wrapping silently',
              'Rust char is 4 bytes (a full Unicode Scalar Value), safely holding accented letters and emojis',
              'Fixed arrays [T; N] store elements contiguously on the stack and perform bounds checks on indexing',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Distinguish compile-time constants (`const`) from runtime `let` bindings, and keep mutability tightly scoped to where state changes actually happen.',
            bullets: [
              'const MAX_USERS: u32 = 10_000 requires an explicit type annotation and compile-time expression',
              'Start with immutable let bindings and add mut only when in-place mutation is genuinely needed',
              'Use checked_add or saturating_add when arithmetic overflow must be handled explicitly',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // Immutable by default, then shadowed with a new type
    let spaces = "   ";
    let spaces = spaces.len(); // Shadowed from &str to usize

    // Explicit mutability with let mut
    let mut count: i32 = 42;
    println!("Initial count: {}, spaces: {}", count, spaces);
    count += 1;

    // Stack-allocated compound types: tuple and fixed array
    let point: (f64, f64) = (3.14, 2.71);
    let scores: [u8; 3] = [90, 95, 100];
    println!("Incremented: {}, point: {:?}, top score: {}", count, point, scores[2]);
}`,
        codeExplanation: [
          'Lines 3-4: Shadowing reuses the identifier `spaces` while changing its type from `&str` to `usize`.',
          'Line 7: `let mut count: i32 = 42` allocates a 4-byte signed integer on the stack with write permission.',
          'Line 12: Tuples pack heterogeneous fields contiguously on the stack.',
          'Line 13: Arrays `[u8; 3]` reserve 3 contiguous stack bytes and guard against out-of-bounds reads.',
        ],
        pitfall: {
          title: 'Reassigning an immutable binding without mut',
          errorCode: 'error[E0384]: cannot assign twice to immutable variable `count`',
          badCode: `let count = 42;
count = 43; // Error: count is immutable`,
          description:
            'Beginners often expect variables to be mutable by default like in Python or JavaScript. Rust locks bindings against mutation unless explicitly marked.',
          fix: 'Declare `let mut count = 42;` if you want to mutate the same slot, or shadow it via `let count = 43;` if transforming the binding.',
        },
        quiz: {
          question: 'Which statement accurately describes `let mut` vs variable shadowing in Rust?',
          options: [
            '`let mut` allows changing a variable’s type in place from `String` to `i32`.',
            'Shadowing with another `let` creates a new binding that can change type while remaining immutable by default.',
            '`const` declarations can be combined with `mut` for global mutable state.',
          ],
          correctIndex: 1,
          explanation:
            '`let mut` can only overwrite values of the exact same type. Shadowing introduces a fresh binding, allowing type conversion while preserving immutability.',
          challengePrompt: 'Make variable `count` mutable by typing the correct Rust keyword:',
          challengePrefix: 'let ',
          challengeKeyword: 'mut',
          challengeSuffix: ' count = 0;',
          challengeSuccess: 'Valid Rust syntax! `mut` makes bindings mutable.',
        },
      },
      ja: {
        title: 'プリミティブ型と可変性',
        shortTitle: '2. 基本型と可変性',
        phase: 'フェーズ 1：基礎固め',
        difficulty: '初級',
        duration: '20 分',
        summary: 'デフォルト不変束縛（let）、可変束縛（let mut）、シャドーイング、スカラー型・タプル・配列のメモリ表現を学びます。',
        tags: ['型システム', 'メモリ配置', '変数束縛'],
        overview:
          'Rust では変数はデフォルトで不変（Immutable）です。値を後から変更したい場合は明示的に `let mut` を指定する必要があります。この安全な設計とスカラー型・複合型を組み合わせることで、スタック上のデータ配置を明確に把握できます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'デフォルト不変性により意図しない状態書き換えが防がれます。既存の値を別の型へ変換したい場合には、同じ変数名を再束縛するシャドーイング（Shadowing）機能が非常に便利です。',
            bullets: [
              'let x = 5 は読み取り専用であり、再代入しようとすると E0384 コンパイルエラーになります',
              'let mut count = 42 で明示的に可変性を付与し、スタック上の値を直接書き換えられます',
              'シャドーイング（let x = x.len()）は新しい束縛を作るため、型の変更も可能です',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              'Rust のスカラー型や固定長配列はコンパイル時にサイズが確定（Sized）しており、スタックフレーム上に直接確保されます。ヒープ確保を伴わず、高速にビットコピー（Copy）されます。',
            bullets: [
              '整数リテラルは既定で i32、浮動小数点は f64 となり、デバッグビルドでは整数オーバーフローをパニックで検知',
              'Rust の char 型は 4 バイトの Unicode スカラー値であり、日本語や絵文字も1文字として格納可能',
              '固定長配列 [T; N] はスタック上に連続配置され、添字アクセス時に自動で境界チェックを実施',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              'コンパイル時定数（const）と実行時変数（let）を明確に使い分け、mut の範囲を最小限に保ちましょう。',
            bullets: [
              'const MAX_CONN: u32 = 10_000 のように const には必ず型注釈が必要です',
              'まずは let（不変）で書き、本当にインプレース変更が必要な箇所だけ mut にします',
              '桁あふれが想定される演算では checked_add や saturating_add を使いましょう',
            ],
          },
        ],
        codeSnippet: `fn main() {
    // デフォルトは不変、シャドーイングで型を変換
    let spaces = "   ";
    let spaces = spaces.len(); // &str から usize へ再束縛

    // let mut で明示的に可変変数を宣言
    let mut count: i32 = 42;
    println!("初期値: {}, 空白数: {}", count, spaces);
    count += 1;

    // スタックに配置される複合型：タプルと固定長配列
    let point: (f64, f64) = (3.14, 2.71);
    let scores: [u8; 3] = [90, 95, 100];
    println!("更新後: {}, 座標: {:?}, 最高点: {}", count, point, scores[2]);
}`,
        codeExplanation: [
          '3-4行目：シャドーイングにより同じ変数名 spaces のまま &str から usize へ型を変換しています。',
          '7行目：let mut count: i32 = 42 はスタック上に4バイトの書き込み可能な整数領域を確保します。',
          '12行目：タプルは異なる型をまとめてスタックに連続配置します。',
          '13行目：配列 [u8; 3] は3バイトの連続領域を確保し、範囲外アクセスを安全に防止します。',
        ],
        pitfall: {
          title: 'mut を付けずに不変変数へ再代入してしまう',
          errorCode: 'error[E0384]: cannot assign twice to immutable variable `count`',
          badCode: `let count = 42;
count = 43; // エラー：不変変数には再代入できない`,
          description:
            '他言語の感覚で変数を書き換えようとすると、不変性チェックによってコンパイル時に拒否されます。',
          fix: '値を書き換える必要がある場合は `let mut count = 42;` と宣言するか、`let count = 43;` でシャドーイングしてください。',
        },
        quiz: {
          question: 'Rust の `let mut` とシャドーイング（Shadowing）に関する正しい説明はどれですか？',
          options: [
            '`let mut` を使えば、同じ変数の型を `String` から `i32` へ直接変更できる。',
            '`let` で同名変数を再宣言するシャドーイングでは、型を変更しつつ新しい不変束縛を作成できる。',
            '`const` 定数に `mut` を組み合わせて可変なグローバル定数を作れる。',
          ],
          correctIndex: 1,
          explanation:
            '`let mut` は同じ型の値のみ更新可能ですが、シャドーイングは新しい束縛を生成するため型変換が可能で、デフォルト不変性も維持されます。',
          challengePrompt: '変数 `count` を可変にする Rust キーワードを入力してください：',
          challengePrefix: 'let ',
          challengeKeyword: 'mut',
          challengeSuffix: ' count = 0;',
          challengeSuccess: '正しい Rust 構文です！`mut` により変数が可変になります。',
        },
      },
    },
  },
  {
    slug: 'ownership-move',
    order: 3,
    phaseKey: 'phase1',
    difficultyKey: 'beginner',
    iconKey: 'shield',
    visualizerSlug: 'ownership',
    prevSlug: 'primitives-mutability',
    nextSlug: 'references-borrowing',
    translations: {
      zh: {
        title: '所有权与移动语义',
        shortTitle: '3. 所有权与移动语义',
        phase: '第一阶段：基础入门',
        difficulty: '初级',
        duration: '30 分钟',
        summary: '深入理解所有权三大黄金法则、栈与堆分配差异，以及 Move 移动语义如何在无 GC 的情况下彻底消除二次释放漏洞。',
        tags: ['所有权', 'Move语义', '内存安全'],
        overview:
          '所有权（Ownership）是 Rust 无需垃圾回收器（GC）就能实现内存安全的核心机制。Rust 中的每个值都有一个唯一的所有者变量；同一时刻只能存在一个所有者；当所有者离开作用域时，该值占用的堆内存会被自动释放（Drop）。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '像 String 或 Vec<T> 这类在堆上动态分配的数据，栈上仅保存一个包含 ptr（指针）、len（长度）和 cap（容量）的 24 字节句柄。如果直接浅拷贝而不作废原变量，作用域结束时就会发生危险的二次释放（Double Free）。',
            bullets: [
              '法则一：Rust 中的每一个值都有一个绑定的所有者（Owner）',
              '法则二：同一时间只能有一个变量拥有该值的所有权',
              '法则三：当所有者离开花括号作用域 } 时，编译器自动插入 drop() 释放资源',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '执行 let s2 = s1; 时，Rust 只复制栈上的 24 字节元数据，并在编译器静态分析中将 s1 标记为“已移动/失效（Moved）”。此后任何读取 s1 的尝试都会被立即拦截并报错 E0382，实现零运行时开销的内存安全。',
            bullets: [
              'Move 语义的时间复杂度为 O(1)，不会隐式执行昂贵的堆内存深拷贝',
              '若确实需要两份独立的堆数据副本，必须显式调用 s1.clone() 提醒性能开销',
              '函数传参（take_ownership(s1)）同样会触发所有权转移，除非传入引用或返回所有权',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '利用 RAII（资源获取即初始化）与所有权转移，Rust 不仅管理内存，还能自动管理文件句柄、TCP 套接字与数据库连接，彻底杜绝资源泄漏。',
            bullets: [
              '当函数只需要读取数据时，优先传递不可变引用 &str 或 &[T] 而不是转移所有权',
              '避免在热循环中无脑调用 .clone()，先思考能否通过借用解决',
              '自定义类型只有全部字段都实现 Copy 且不实现 Drop 时，才能派生 #[derive(Copy, Clone)]',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let s1 = String::from("hello");
    // 所有权从 s1 移动（Move）到 s2，s1 立即失效！
    let s2 = s1;

    // println!("{}", s1); // COMPILE ERROR: value borrowed here after move
    println!("s2 现在拥有唯一所有权: {}", s2);

    // 如需保留原变量继续使用，需显式调用 .clone() 深拷贝堆缓冲区
    let s3 = s2.clone();
    println!("s2 = {}, s3 = {}", s2, s3);
}`,
        codeExplanation: [
          '第 2 行：String::from("hello") 在堆上分配 5 字节内容，栈帧 s1 存储 ptr/len/cap。',
          '第 4 行：let s2 = s1 执行所有权移动（Move），仅拷贝栈上指针信息，并将 s1 标记为已失效。',
          '第 6 行：注释中的 println!("{}", s1) 若取消注释，将触发 E0382 编译错误。',
          '第 10 行：s2.clone() 在堆上申请新缓冲区并复制字符，使 s2 和 s3 拥有各自独立的所有权。',
        ],
        pitfall: {
          title: '在所有权移出后继续使用原变量（Use-After-Move）',
          errorCode: 'error[E0382]: borrow of moved value: `s1`',
          badCode: `let s1 = String::from("Ferris");
let s2 = s1;
println!("{}", s1); // s1 所有权已移动至 s2`,
          description:
            '将堆分配类型赋值给新变量或传递给按值接收的函数后，原变量绑定即被消耗。继续读取它会被借用检查器直接阻止。',
          fix: '根据场景二选一：要么改为借用 `let r = &s1;` 避免转移所有权；要么显式调用 `let s2 = s1.clone();` 复制一份独立的堆数据。',
        },
        quiz: {
          question: '在 Rust 中执行 `let s1 = String::from("hello"); let s2 = s1;` 后，栈变量 s1 会发生什么？',
          options: [
            '深拷贝（Deep copy）：s1 和 s2 各自持有一份独立的堆内存拷贝。',
            '移动语义（Move）：堆数据的所有权转移给 s2，同时 s1 在编译期被立即标记为失效。',
            '共享引用：s1 和 s2 同时拥有读写权并共享同一个堆指针。',
          ],
          correctIndex: 1,
          explanation:
            'Rust 通过仅浅复制栈上 24 字节元数据并使原变量 s1 失效来转移所有权，以零运行时成本杜绝悬垂指针和二次释放。',
          challengePrompt: '填入显式深拷贝 String 堆数据的方法名：',
          challengePrefix: 'let s2 = s1.',
          challengeKeyword: 'clone',
          challengeSuffix: '();',
          challengeSuccess: '回答正确！`.clone()` 会显式分配并深拷贝堆上数据，保留原变量有效。',
        },
      },
      en: {
        title: 'Ownership & Move Semantics',
        shortTitle: '3. Ownership & Move',
        phase: 'Phase 1: Foundations',
        difficulty: 'Beginner',
        duration: '30 min',
        summary: 'Understand the three fundamental ownership rules, Stack vs. Heap allocation, and how Move semantics eliminate double-free errors.',
        tags: ['Ownership', 'Move', 'Memory Safety'],
        overview:
          'Ownership is Rust’s core mechanism for memory safety without a garbage collector. Each value has an owner, only one owner exists at a time, and when the owner goes out of scope, the memory is freed automatically via deterministic RAII drops.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Heap-backed types like `String` and `Vec<T>` store only a 24-byte handle (ptr, len, cap) on the stack pointing to dynamic heap storage. If two variables quietly owned the same pointer, freeing both at scope exit would cause catastrophic double-free corruption.',
            bullets: [
              'Rule 1: Every value in Rust has an explicit owner binding',
              'Rule 2: There can only be one owner at any point in time',
              'Rule 3: When the owner exits its lexical scope }, Rust automatically calls drop()',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Executing `let s2 = s1;` copies only the 24-byte stack metadata and marks `s1` as moved at compile time. Any subsequent attempt to read `s1` triggers error[E0382] with zero runtime reference-counting overhead.',
            bullets: [
              'Move semantics run in O(1) time without performing hidden expensive heap copies',
              'Calling `.clone()` explicitly duplicates heap buffers when two independent owners are needed',
              'Passing a non-Copy value by value into a function transfers ownership into that function frame',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Ownership manages far more than heap memory: file descriptors, mutex guards, and network sockets automatically close the instant their owner leaves scope.',
            bullets: [
              'Accept `&str` or `&[T]` slices in helper functions when you only need to inspect data',
              'Avoid sprinkling `.clone()` blindly in hot loops; prefer borrowing first',
              'Only small stack-only structs whose fields all implement Copy can derive `#[derive(Copy, Clone)]`',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let s1 = String::from("hello");
    // Ownership moves from s1 to s2.
    // s1 is invalidated here!
    let s2 = s1;

    // println!("{}", s1); // COMPILE ERROR: value borrowed here after move
    println!("s2 has ownership: {}", s2);

    // Use .clone() explicitly when an independent heap copy is needed
    let s3 = s2.clone();
    println!("s2 = {}, s3 = {}", s2, s3);
}`,
        codeExplanation: [
          'Line 2: `String::from("hello")` allocates 5 bytes on the heap and places (ptr, len, cap) on the stack.',
          'Line 5: `let s2 = s1` performs a move—copying stack metadata and invalidating `s1`.',
          'Line 7: Accessing `s1` after move is caught statically by the compiler with error[E0382].',
          'Line 11: `s2.clone()` allocates a second heap buffer so both `s2` and `s3` remain valid owners.',
        ],
        pitfall: {
          title: 'Using a variable after its ownership has moved',
          errorCode: 'error[E0382]: borrow of moved value: `s1`',
          badCode: `let s1 = String::from("Ferris");
let s2 = s1;
println!("{}", s1); // s1 was moved into s2`,
          description:
            'Assigning a heap-owning value or passing it by value to a function consumes the original binding. Trying to read it later triggers a compile-time move error.',
          fix: 'Either borrow without moving (`let r = &s1;`) or explicitly duplicate the heap buffer (`let s2 = s1.clone();`).',
        },
        quiz: {
          question: 'What happens to the stack variable `s1` when executing `let s1 = String::from("hello"); let s2 = s1;` in Rust?',
          options: [
            'Deep copy: Both s1 and s2 own separate copies of the heap buffer.',
            'Move semantics: Ownership transfers to s2; s1 becomes invalidated.',
            'Shared reference: Both point to the same buffer without invalidation.',
          ],
          correctIndex: 1,
          explanation:
            'Rust moves ownership from s1 to s2 by copying the 24-byte stack handle and invalidating s1 at compile time, preventing double-free bugs at zero runtime cost.',
          challengePrompt: 'Type the method name used to explicitly deep-copy heap data of a String:',
          challengePrefix: 'let s2 = s1.',
          challengeKeyword: 'clone',
          challengeSuffix: '();',
          challengeSuccess: 'Valid Rust syntax! `.clone()` explicitly duplicates heap allocations.',
        },
      },
      ja: {
        title: '所有権とムーブセマンティクス',
        shortTitle: '3. 所有権とムーブ',
        phase: 'フェーズ 1：基礎固め',
        difficulty: '初級',
        duration: '30 分',
        summary: '所有権の3つの基本ルール、スタックとヒープの違い、そしてムーブセマンティクスが二重解放を根絶する仕組みを学びます。',
        tags: ['所有権', 'ムーブ', 'メモリ安全'],
        overview:
          '所有権（Ownership）はガベージコレクタなしでメモリ安全性を実現する Rust 最大の特徴です。すべての値には唯一の所有者が存在し、所有者がスコープを抜けた瞬間にメモリが自動的に解放されます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'String や Vec<T> のようなヒープ確保型は、スタック上に ptr・len・cap の3ワード（24バイト）のみを保持します。単純なポインタコピーを許すと、スコープ終了時に二重解放（Double Free）バグを引き起こします。',
            bullets: [
              'ルール1：Rust のすべての値には「所有者」となる変数が存在する',
              'ルール2：いかなる時点でも所有者はただ1つだけ存在する',
              'ルール3：所有者がスコープ } を抜けると、自動的に drop() が呼ばれメモリが解放される',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '`let s2 = s1;` を実行すると、スタック上の24バイトだけがコピーされ、元の `s1` はコンパイラによって無効化（Moved）されます。以降 `s1` にアクセスしようとするとコンパイルエラー E0382 となり、実行時コストゼロで安全が保証されます。',
            bullets: [
              'ムーブは O(1) のスタックコピーのみで完了し、暗黙的なヒープ複製は発生しません',
              '独立した複製が必要な場合は `.clone()` を明示的に呼び出します',
              '値渡しで関数に引数を渡す場合も所有権が関数側へムーブします',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '所有権モデル（RAII）はメモリだけでなく、ファイルハンドルやネットワークソケットの自動クローズにも活用されます。',
            bullets: [
              '読み取り専用の関数には所有権を奪わず `&str` や `&[T]` の借用を渡しましょう',
              'パフォーマンスクリティカルなループ内での安易な `.clone()` は避け、まず借用を検討します',
              'すべてのフィールドが Copy な小型構造体にのみ `#[derive(Copy, Clone)]` を付与できます',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let s1 = String::from("hello");
    // 所有権が s1 から s2 へムーブし、s1 は無効化される
    let s2 = s1;

    // println!("{}", s1); // COMPILE ERROR: value borrowed here after move
    println!("s2 が所有権を保持しています: {}", s2);

    // 両方を使いたい場合は明示的に .clone() でヒープを複製する
    let s3 = s2.clone();
    println!("s2 = {}, s3 = {}", s2, s3);
}`,
        codeExplanation: [
          '2行目：String::from("hello") がヒープに5バイト確保し、スタックの s1 にメタデータを格納します。',
          '4行目：let s2 = s1 でムーブが発生し、s1 はコンパイル時に無効化されます。',
          '6行目：コメントアウトされた s1 の使用は error[E0382] によってコンパイル時に阻止されます。',
          '10行目：s2.clone() により新しいヒープ領域が割り当てられ、s2 と s3 の両方が有効になります。',
        ],
        pitfall: {
          title: '所有権のムーブ後に元の変数を参照してしまう（Use-After-Move）',
          errorCode: 'error[E0382]: borrow of moved value: `s1`',
          badCode: `let s1 = String::from("Ferris");
let s2 = s1;
println!("{}", s1); // s1 はすでに s2 へムーブ済み`,
          description:
            'ヒープを所有する値を別変数へ代入したり関数へ値渡しすると、元の束縛は無効になります。その後で読み取ろうとすると借用チェッカーがエラーを出します。',
          fix: '所有権を移したくない場合は参照（`let r = &s1;`）を使うか、複製が必要な場合は `let s2 = s1.clone();` を記述します。',
        },
        quiz: {
          question: 'Rust で `let s1 = String::from("hello"); let s2 = s1;` を実行した直後、変数 s1 はどうなりますか？',
          options: [
            'ディープコピー：s1 と s2 がそれぞれ独立したヒープ領域を所有する。',
            'ムーブセマンティクス：所有権が s2 へ移動し、s1 は無効化される。',
            '共有参照：両方が同じヒープ領域への読み書き権限を共有する。',
          ],
          correctIndex: 1,
          explanation:
            'Rust はスタック上のポインタ情報のみをコピーし s1 を無効化することで、実行時コストゼロのまま二重解放を防ぎます。',
          challengePrompt: 'String のヒープデータを明示的にディープコピーするメソッド名を入力してください：',
          challengePrefix: 'let s2 = s1.',
          challengeKeyword: 'clone',
          challengeSuffix: '();',
          challengeSuccess: '正解です！`.clone()` は明示的にヒープバッファを複製します。',
        },
      },
    },
  },
  {
    slug: 'references-borrowing',
    order: 4,
    phaseKey: 'phase1',
    difficultyKey: 'beginner',
    iconKey: 'lock',
    visualizerSlug: 'borrow-checker',
    prevSlug: 'ownership-move',
    nextSlug: 'lifetimes-scopes',
    translations: {
      zh: {
        title: '引用与借用规则',
        shortTitle: '4. 引用与借用规则',
        phase: '第一阶段：基础入门',
        difficulty: '初级',
        duration: '25 分钟',
        summary: '掌握不可变引用（&T）与可变引用（&mut T）的读写互斥规则，以及非词法生命周期（NLL）如何在编译期消除数据竞争。',
        tags: ['借用规则', '共享引用', '可变引用'],
        overview:
          '借用（Borrowing）允许函数临时访问数据而无需夺走所有权。在同一作用域的活跃租约期（Lease）内，你要么可以拥有任意多个不可变引用（&T），要么只能拥有唯一一个可变引用（&mut T），从而在编译期根除数据竞争与迭代器失效。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '可以把 Rust 的引用想象成读写锁（RwLock）的编译期静态等价物：共享引用 &T 如同读锁，可并发存在多个；独占可变引用 &mut T 如同写锁，同一时刻全局唯一。',
            bullets: [
              '不可变引用 &T 允许安全只读访问，函数返回后不会释放原数据',
              '独占可变引用 &mut T 允许就地修改底层数据，但要求原绑定本身也带有 mut',
              '任何引用都必须始终指向有效内存（编译器严格禁止悬垂引用 Dangling Reference）',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '现代 Rust（2018+）引入了非词法作用域生命周期（NLL，Non-Lexical Lifetimes）：引用的生命周期不再持续到花括号 } 结束，而是在最后一次实际使用点之后立即终止，极大减少了虚假借用冲突。',
            bullets: [
              '共享与可变不可同时活跃：在 &T 最后一次使用前创建 &mut T 会触发错误 E0502',
              '同一数据同一时刻不能存在两个活跃的 &mut T（触发错误 E0499），从源头上杜绝别名写冲突',
              '函数参数尽量使用切片引用（&str、&[T]）替代 &String 或 &Vec<T>，通用性更强',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '当结构体方法同时需要读写不同字段时，如果整体借用 `&mut self` 导致冲突，可以拆分为字段级借用或独立纯函数。',
            bullets: [
              '在调用接受 &mut 的方法前，确保所有旧的只读引用已经完成最后一次读取',
              '函数返回引用时，不能返回函数内部局部变量的引用（应直接按值返回转移所有权）',
              '需要拆借数组/切片的两部分时，标准库提供 split_at_mut() 安全切分两个互不重叠的可变切片',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let mut data = String::from("Ferris");

    // 多个不可变借用可同时存在（只读并发安全）
    let r1 = &data;
    let r2 = &data;
    println!("不可变读取: {}, {}, 长度={}", r1, r2, calculate_length(r1));
    // NLL：r1 和 r2 在上一行最后一次使用后生命周期即结束！

    // 现在可以安全获取独占可变借用
    append_crab(&mut data);
    println!("修改后的内容: {}", data);
}

fn calculate_length(s: &str) -> usize {
    s.len()
}

fn append_crab(s: &mut String) {
    s.push_str(" 🦀");
}`,
        codeExplanation: [
          '第 5-7 行：r1 和 r2 是同时活跃的两个不可变借用 &String，读取互不干扰。',
          '第 8 行：得益于 NLL（非词法生命周期），r1 与 r2 在最后一次打印后立即失效。',
          '第 11 行：因此后续的 &mut data 独占可变借用完全合法，可以就地追加 " 🦀"。',
          '第 15 行：calculate_length 接收 &str 而非 &String，通过 Deref 强制转换兼容两者。',
        ],
        pitfall: {
          title: '在共享引用仍活跃时创建可变引用',
          errorCode: 'error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable',
          badCode: `let mut data = vec![1, 2, 3];
let first = &data[0];     // 不可变借用开始
data.push(4);             // 隐式 &mut data 可能触发扩容重分配！
println!("{}", first);    // first 仍在后续使用，形成冲突`,
          description:
            '如果允许在持有元素引用 first 的同时向 Vec 追加元素，Vec 扩容重新分配堆内存后，first 就会变成指向已释放内存的悬垂指针！',
          fix: '调整语句顺序：先完成对 `first` 的所有读取（或复制值 `let first = data[0];`），然后再调用 `data.push(4);`。',
        },
        quiz: {
          question: '在同一作用域且旧引用后续仍会被使用的情况下，能否在已有不可变引用 (&T) 活跃时再创建一个可变引用 (&mut T)？',
          options: [
            '可以，Rust 允许同一作用域内同时存在无限个可变与不可变引用。',
            '不可以，Rust 强制保证同一时刻要么有任意多个不可变引用，要么只有唯一一个可变引用。',
            '可以，只要该变量添加了 static 关键字即可。',
          ],
          correctIndex: 1,
          explanation:
            'Rust 借用检查器保证：当存在其他只读引用观察数据时，数据不能被任何可变引用修改，从而在编译期彻底消灭数据竞争与悬垂指针。',
          challengePrompt: '填入创建“可变引用”所需的符号前缀：',
          challengePrefix: 'let m = ',
          challengeKeyword: '&mut',
          challengeSuffix: ' data;',
          challengeSuccess: 'Syntax 验证通过！`&mut` 创建独占可变借用。',
        },
      },
      en: {
        title: 'References & Borrowing',
        shortTitle: '4. References & Borrowing',
        phase: 'Phase 1: Foundations',
        difficulty: 'Beginner',
        duration: '25 min',
        summary: 'Learn immutable references (&T) vs mutable references (&mut T), aliasing rules, and compile-time data race prevention.',
        tags: ['Borrowing', 'Pointers', 'Safety'],
        overview:
          'Borrowing allows accessing data without taking ownership. You can have any number of immutable references (&T) OR exactly one mutable reference (&mut T) active at any given time, preventing data races and iterator invalidation at compile time.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Think of Rust references as a compile-time read-write lock: shared references (`&T`) allow unlimited concurrent readers, while an exclusive mutable reference (`&mut T`) grants sole write access with no concurrent readers.',
            bullets: [
              'Immutable references (&T) grant read-only access without taking ownership',
              'Mutable references (&mut T) enable in-place mutation when the underlying binding is mut',
              'References are guaranteed non-null and always valid—dangling pointers fail to compile',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Modern Rust uses Non-Lexical Lifetimes (NLL): a reference’s borrow scope ends immediately after its final usage rather than waiting until the closing brace `}`, eliminating false-positive borrow conflicts.',
            bullets: [
              'Attempting &mut T while &T is still used later triggers error[E0502]',
              'Creating two overlapping &mut T borrows triggers error[E0499], eliminating aliasing writes',
              'Prefer slice parameters (&str, &[T]) over &String or &Vec<T> via Deref coercion',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Structure read and write phases cleanly so shared borrows finish before mutable operations begin, and avoid returning references to local stack frames.',
            bullets: [
              'Consume or finish reading shared borrows before calling mutating methods like Vec::push',
              'Return owned values directly from constructors rather than trying to return local references',
              'Use slice::split_at_mut() when you genuinely need two non-overlapping mutable sub-slices',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let mut data = String::from("Ferris");

    // Multiple immutable borrows are allowed simultaneously
    let r1 = &data;
    let r2 = &data;
    println!("Shared reads: {}, {}, len={}", r1, r2, calculate_length(r1));
    // NLL: r1 and r2 expire right after their last usage above!

    // Exclusive mutable borrow is now safe
    append_crab(&mut data);
    println!("Modified: {}", data);
}

fn calculate_length(s: &str) -> usize {
    s.len()
}

fn append_crab(s: &mut String) {
    s.push_str(" 🦀");
}`,
        codeExplanation: [
          'Lines 5-7: Multiple shared borrows (`r1`, `r2`) read `data` concurrently without conflict.',
          'Line 8: With Non-Lexical Lifetimes (NLL), `r1` and `r2` expire immediately after `println!`.',
          'Line 11: Acquiring `&mut data` succeeds cleanly to append `" 🦀"` in place.',
          'Line 15: Accepting `&str` works seamlessly for both `&String` and string literals.',
        ],
        pitfall: {
          title: 'Mutating a collection while holding an immutable element reference',
          errorCode: 'error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable',
          badCode: `let mut data = vec![1, 2, 3];
let first = &data[0];   // immutable borrow starts
data.push(4);           // mutable borrow may reallocate heap!
println!("{}", first);  // first used later -> dangling pointer prevented!`,
          description:
            'Pushing to a Vec might reallocate its heap buffer and invalidate `first`. Rust’s borrow checker spots the overlapping leases and saves you from undefined behavior.',
          fix: 'Finish using `first` before mutating (`println` before `push`), or copy the primitive value (`let first = data[0];`).',
        },
        quiz: {
          question: 'Can you create an exclusive mutable reference (&mut T) while immutable references (&T) are active in the same scope?',
          options: [
            'Yes, Rust allows unlimited concurrent mutable and immutable references simultaneously.',
            'No, Rust enforces either any number of immutable references OR exactly one mutable reference at a time.',
            'Yes, but only if the variable is marked static.',
          ],
          correctIndex: 1,
          explanation:
            'Rust’s borrow checker guarantees that data cannot be mutated through one reference while other references are reading it, preventing data races.',
          challengePrompt: 'Type the operator prefix used to create an exclusive mutable reference:',
          challengePrefix: 'let m = ',
          challengeKeyword: '&mut',
          challengeSuffix: ' data;',
          challengeSuccess: 'Valid Rust syntax! `&mut` creates an exclusive mutable borrow.',
        },
      },
      ja: {
        title: '参照と借用ルール',
        shortTitle: '4. 参照と借用ルール',
        phase: 'フェーズ 1：基礎固め',
        difficulty: '初級',
        duration: '25 分',
        summary: '不変参照（&T）と可変参照（&mut T）の排他ルール、および NLL によるデータ競合のコンパイル時防止を学びます。',
        tags: ['借用ルール', '共有参照', '可変参照'],
        overview:
          '借用（Borrowing）を使うと所有権を奪わずにデータへアクセスできます。ある時点において、不変参照（&T）はいくつでも同時に持てますが、可変参照（&mut T）はただ1つだけしか持てないというルールにより、データ競合が根絶されます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'Rust の参照はコンパイル時に検証される読み書きロック（RwLock）に似ています。不変参照 `&T` は共有の読み取りロック、可変参照 `&mut T` は排他的な書き込みロックとして機能します。',
            bullets: [
              '不変参照 &T は読み取り専用であり、所有権を奪わずにデータを貸し出します',
              '可変参照 &mut T は元の変数が mut である場合にデータの直接変更を可能にします',
              'すべての参照は常に有効なメモリを指すことが保証され、ダングリング参照はコンパイル不可です',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '現代の Rust は非語彙的ライフタイム（NLL）を採用しており、参照の有効期間はブロック末尾 `}` ではなく「最後に使われた行」で直ちに終了します。',
            bullets: [
              '&T がまだ生存中に &mut T を作成しようとすると error[E0502] が発生します',
              '同じデータに対して2つの &mut T を同時に持つと error[E0499] で拒否されます',
              '関数引数には &String や &Vec<T> よりも汎用的なスライス参照（&str, &[T]）を使うのが定石です',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '読み取りフェーズと書き込みフェーズを明確に分離し、ローカル変数への参照を関数から返さないよう設計しましょう。',
            bullets: [
              'Vec::push のような可変メソッドを呼ぶ前に、既存の不変参照の使用を完了させます',
              '関数内で生成した値は参照ではなく所有権ごと（値返しで）返却します',
              '配列を2つの非重複な可変スライスに分けたい場合は `split_at_mut()` を活用できます',
            ],
          },
        ],
        codeSnippet: `fn main() {
    let mut data = String::from("Ferris");

    // 不変借用は同時に複数作成できる
    let r1 = &data;
    let r2 = &data;
    println!("共有読み取り: {}, {}, 長さ={}", r1, r2, calculate_length(r1));
    // NLL により、r1 と r2 は上の行で最後の使用を終えて失効！

    // したがって排他的な可変借用を安全に取得できる
    append_crab(&mut data);
    println!("変更後: {}", data);
}

fn calculate_length(s: &str) -> usize {
    s.len()
}

fn append_crab(s: &mut String) {
    s.push_str(" 🦀");
}`,
        codeExplanation: [
          '5-7行目：複数の不変参照 r1, r2 が同時に存在して安全に読み取ります。',
          '8行目：NLL によって最後の利用直後に r1 と r2 の借用期間が終了します。',
          '11行目：他の借用がなくなったため、&mut data による書き換えが許可されます。',
          '15行目：引数を &str にすることで &String と文字列リテラルの両方を受け取れます。',
        ],
        pitfall: {
          title: '不変借用が生きている間にコレクションを変更してしまう',
          errorCode: 'error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable',
          badCode: `let mut data = vec![1, 2, 3];
let first = &data[0];   // 不変借用の開始
data.push(4);           // 容量拡張でヒープが再確保される可能性！
println!("{}", first);  // 後で first を使うため危険！`,
          description:
            '`data.push(4)` がメモリ再配置を起こすと、要素への参照 `first` が不正なアドレスを指す恐れがあります。コンパイラがこれを未然に防ぎます。',
          fix: '`push` の前に `first` を使い切るか、プリミティブ値なら `let first = data[0];` としてコピーを保持してください。',
        },
        quiz: {
          question: '同じスコープ内で不変参照（&T）がまだ使用中であるとき、同じデータへの可変参照（&mut T）を作成できますか？',
          options: [
            'はい、Rust は可変参照と不変参照をいくつでも同時に併用できます。',
            'いいえ、任意の数の不変参照か、ただ1つの可変参照のどちらか一方しか持てません。',
            'はい、ただし static 変数の場合に限ります。',
          ],
          correctIndex: 1,
          explanation:
            '借用チェッカーにより、他の参照が読み取っている最中にデータが書き換えられることをコンパイル時に防ぎ、データ競合を根絶します。',
          challengePrompt: '排他的な可変参照を作成するための演算子プレフィックスを入力してください：',
          challengePrefix: 'let m = ',
          challengeKeyword: '&mut',
          challengeSuffix: ' data;',
          challengeSuccess: '正しい Rust 構文です！`&mut` で可変借用を作成します。',
        },
      },
    },
  },
  {
    slug: 'lifetimes-scopes',
    order: 5,
    phaseKey: 'phase2',
    difficultyKey: 'intermediate',
    iconKey: 'repeat',
    visualizerSlug: 'borrow-checker',
    prevSlug: 'references-borrowing',
    nextSlug: 'structs-enums',
    translations: {
      zh: {
        title: '生命周期与借用检查器',
        shortTitle: '5. 生命周期与作用域',
        phase: '第二阶段：深入核心',
        difficulty: '中级',
        duration: '35 分钟',
        summary: "揭开泛型生命周期标注（'a）的神秘面纱，理解生命周期省略规则，掌握编译器如何根除悬垂引用。",
        tags: ['生命周期', '借用检查器', '作用域'],
        overview:
          "生命周期（Lifetime）描述的是引用保持有效的代码作用域。大多数情况下编译器可以自动推导，但当函数或结构体关联多个引用时，我们需要用泛型生命周期参数 `'a` 向编译器显式说明输入与输出引用之间的存活约束关系。",
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              "生命周期标注 `'a` 并不会改变任何值的实际存活时间——它只是给多个引用之间的关系贴上“关联标签”，让借用检查器在不阅读函数体实现的情况下仅凭签名就能验证安全。",
            bullets: [
              "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str 表示返回值存活期不长于 x 和 y 中较短的那个",
              "编译器内置三条“生命周期省略规则”（Lifetime Elision），覆盖 90% 的单输入参数场景",
              "'static 生命周期表示引用指向的数据可存活至整个程序结束（如字符串字面量）",
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '若结构体内部持有引用字段而非拥有所有权的数据，必须为结构体声明生命周期参数，确保结构体实例绝对不能比它所引用的源数据活得更久。',
            bullets: [
              "struct Excerpt<'a> { part: &'a str } 保证 Excerpt 的生命期严格包含于 part 所指字符串内",
              '试图从内部块返回一个指向已释放栈帧的引用会触发 E0597（borrowed value does not live long enough）',
              "方法块实现写作 impl<'a> Excerpt<'a>，其中 &self 的省略规则可进一步简化签名",
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              "除非为了零拷贝解析或追求极致性能，否则在结构体与跨线程数据中优先存储拥有所有权的类型（如 String 或 Arc<T>），能显著降低生命周期传染性。",
            bullets: [
              "不要把所有参数都盲目加上同一个 `'a` 当作万能胶，若某参数与返回值无关应独立使用 `'b`",
              "遇到复杂的 'static 报错时，仔细分辨需要的是拥有所有权（T: 'static）还是字面量 &'static str",
              '在解析器与零拷贝场景中使用生命周期，能让服务减少海量堆分配',
            ],
          },
        ],
        codeSnippet: `// 显式生命周期标注 'a：返回切片的存活时间受限于 x 与 y 中较短者
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

// 持有引用的结构体必须携带生命周期参数
struct Highlight<'a> {
    snippet: &'a str,
}

fn main() {
    let text = String::from("Rust zero-cost abstractions");
    let first_word = &text[..4];
    let h = Highlight { snippet: first_word };

    let result = longest(h.snippet, "Rustacean");
    println!("更长切片: {}", result);
}`,
        codeExplanation: [
          "第 2 行：<'a> 声明泛型生命周期参数，约束返回值必须在 x 和 y 都有效的范围内使用。",
          "第 7 行：Highlight<'a> 声明其字段 snippet 引用的字符串必须比结构体实例本身活得更久。",
          '第 12-14 行：text 在整个 main 中有效，因此派生出的切片 h.snippet 满足安全借用要求。',
          '第 16 行："Rustacean" 具有 ' + "'static 生命周期，与较短的 h.snippet 取交集后安全返回。",
        ],
        pitfall: {
          title: '返回比源数据活得更久的引用（E0597）',
          errorCode: 'error[E0597]: `inner` does not live long enough',
          badCode: `let r;
{
    let inner = String::from("short-lived");
    r = longest("long", inner.as_str()); // inner 在内层 } 处被销毁
}
println!("{}", r); // 错误：r 可能指向已被释放的 inner`,
          description:
            "因为 longest 的签名将返回值生命周期绑定到了两个输入参数 `'a` 的交集，即使运行时实际返回的是字面量，编译器仍会按最保守签名判定 r 在内层块结束后悬垂。",
          fix: '扩大 `inner` 的作用域使其包裹 `println!`，或直接返回拥有所有权的 `String` 而不是 `&str`。',
        },
        quiz: {
          question: "函数签名 `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` 中的 `'a` 真正含义是什么？",
          options: [
            '它强制延长输入参数 x 和 y 在内存中的存活时间直到程序退出。',
            '它向编译器描述约束：返回引用的有效作用域不能超过 x 和 y 各自作用域的交集（较短者）。',
            '它表示函数内部会使用垃圾回收器管理字符串切片。',
          ],
          correctIndex: 1,
          explanation:
            '生命周期标注从不改变值的实际存活时间，而是向借用检查器说明输入引用与输出引用之间的最小公共有效范围。',
          challengePrompt: "补全结构体的泛型生命周期参数语法：",
          challengePrefix: 'struct Excerpt<',
          challengeKeyword: "'a",
          challengeSuffix: "> { part: &'a str }",
          challengeSuccess: "语法完全正确！`'a` 是 Rust 标准泛型生命周期参数语法。",
        },
      },
      en: {
        title: 'Lifetimes & Borrow Checker',
        shortTitle: '5. Lifetimes & Scopes',
        phase: 'Phase 2: Deep Dive',
        difficulty: 'Intermediate',
        duration: '35 min',
        summary: "Demystify generic lifetime annotations ('a), scope validation, and why dangling references cannot exist in safe Rust.",
        tags: ['Lifetimes', 'Borrow Checker', 'Scopes'],
        overview:
          "Lifetimes describe the scope over which a reference remains valid. While the Rust compiler infers most lifetimes automatically via elision rules, generic lifetime annotations like `'a` let functions and structs declare relationships between input and output borrows.",
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              "Lifetime annotations like `'a` never change how long any value actually lives. Instead, they act as relational contracts in function signatures so the borrow checker can prove safety without inspecting function bodies.",
            bullets: [
              "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str ties return validity to the shorter of x and y",
              'Three lifetime elision rules handle simple signatures automatically without manual annotations',
              "The `'static` lifetime indicates data valid for the entire duration of the running binary",
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'When a struct stores references rather than owned values, it must carry a lifetime parameter ensuring the struct instance can never outlive the referenced data.',
            bullets: [
              "struct Highlight<'a> { snippet: &'a str } prevents Highlight from outliving snippet",
              'Returning a borrow to a dropped inner block triggers error[E0597] (does not live long enough)',
              "Methods in impl<'a> Highlight<'a> leverage &self elision rules cleanly",
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Use owned types like `String` or `Arc<T>` for long-lived domain models and reach for borrowed slices with lifetimes when building zero-copy parsers.',
            bullets: [
              "Avoid forcing unrelated reference parameters onto a single `'a` when independent `'b` fits better",
              "Remember `T: 'static` on trait bounds means T owns no short-lived borrows—it does not forbid heap allocation",
              'Zero-copy parsing with `&\'a str` avoids unnecessary heap allocations on hot paths',
            ],
          },
        ],
        codeSnippet: `// Generic lifetime 'a constrains the return slice to the overlap of x and y
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

// Struct holding a reference requires a lifetime parameter
struct Highlight<'a> {
    snippet: &'a str,
}

fn main() {
    let text = String::from("Rust zero-cost abstractions");
    let first_word = &text[..4];
    let h = Highlight { snippet: first_word };

    let result = longest(h.snippet, "Rustacean");
    println!("Longer slice: {}", result);
}`,
        codeExplanation: [
          "Line 2: `<'a>` declares a lifetime parameter binding both inputs and the returned `&str`.",
          "Line 7: `Highlight<'a>` guarantees instances cannot outlive the borrowed `snippet`.",
          'Lines 12-14: `text` outlives `h`, keeping `h.snippet` valid throughout `main`.',
          'Line 16: `"Rustacean"` has `' + "`static` lifetime; the compiler computes the safe intersection with `h.snippet`.",
        ],
        pitfall: {
          title: 'Reference outliving the scope of its source value (E0597)',
          errorCode: 'error[E0597]: `inner` does not live long enough',
          badCode: `let r;
{
    let inner = String::from("short-lived");
    r = longest("long", inner.as_str()); // inner drops at closing brace
}
println!("{}", r); // Error: r might reference dropped inner`,
          description:
            "Because `longest` binds the output lifetime `'a` to both arguments conservatively, the compiler rejects using `r` after `inner` goes out of scope.",
          fix: 'Hoist `inner` into the outer scope or return an owned `String` instead of a borrowed slice.',
        },
        quiz: {
          question: "What does `'a` mean in `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`?",
          options: [
            'It extends the runtime lifetime of x and y until program termination.',
            'It tells the borrow checker that the returned reference is valid only for the overlap (shorter) of x and y’s scopes.',
            'It instructs the garbage collector to pin both strings in memory.',
          ],
          correctIndex: 1,
          explanation:
            'Lifetime annotations describe relationships between references; the compiler ensures the return value never outlives the shorter input borrow.',
          challengePrompt: 'Complete the lifetime generic parameter syntax on the struct definition:',
          challengePrefix: 'struct Excerpt<',
          challengeKeyword: "'a",
          challengeSuffix: "> { part: &'a str }",
          challengeSuccess: "Valid Rust syntax! `'a` declares a generic lifetime parameter.",
        },
      },
      ja: {
        title: 'ライフタイムと借用チェッカー',
        shortTitle: '5. ライフタイムとスコープ',
        phase: 'フェーズ 2：深掘り理解',
        difficulty: '中級',
        duration: '35 分',
        summary: "ジェネリックライフタイム注釈（'a）の意味、省略規則、そしてダングリング参照が絶対に発生しない理由を理解します。",
        tags: ['ライフタイム', '借用チェッカー', 'スコープ'],
        overview:
          "ライフタイム（Lifetime）は参照が有効であるスコープを表します。多くの場合はコンパイラが自動推論しますが、複数の参照を受け取って参照を返す関数や構造体では `'a` のような注釈を使って生存期間の関係性を明示します。",
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              "ライフタイム注釈 `'a` は実際の変数の寿命を延ばすものではありません。複数の参照の「生存期間の結びつき」を関数シグネチャ上で表現し、借用チェッカーが関数本体を見ずに安全性を証明できるようにします。",
            bullets: [
              "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str は戻り値が x と y の短い方以上に長生きしないことを保証",
              'ライフタイム省略規則（Elision）により、単純なシグネチャでは注釈を省略可能',
              "`'static` はプログラム終了まで有効な静的データ（文字列リテラル等）を指します",
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '構造体が所有権ではなく参照をフィールドに持つ場合、構造体自身にライフタイムパラメータを付与し、参照元データより長生きできないよう制約します。',
            bullets: [
              "struct Highlight<'a> { snippet: &'a str } によりダングリング参照を含む構造体を防止",
              '内側ブロックで解放された変数への参照を外へ持ち出そうとすると error[E0597] で拒否',
              "impl<'a> Highlight<'a> 内のメソッドでは &self の省略規則が適用されます",
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              'ドメインデータには所有型（String, Arc<T>）を優先し、ゼロコピーパーサなど性能重視の局所でライフタイム付きスライスを使いましょう。',
            bullets: [
              "無関係な引数同士を無理に同じ `'a` にまとめず、必要に応じて `'b` と分離します",
              "`T: 'static` トレイト境界は「短命な借用を含まない」ことを意味し、所有型も満たします",
              'ゼロコピー処理にライフタイムを活用することで不要なヒープ確保を削減できます',
            ],
          },
        ],
        codeSnippet: `// ライフタイム注釈 'a：戻り値の寿命は x と y の共通部分に制限される
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

// 参照を保持する構造体にはライフタイムパラメータが必要
struct Highlight<'a> {
    snippet: &'a str,
}

fn main() {
    let text = String::from("Rust zero-cost abstractions");
    let first_word = &text[..4];
    let h = Highlight { snippet: first_word };

    let result = longest(h.snippet, "Rustacean");
    println!("より長いスライス: {}", result);
}`,
        codeExplanation: [
          "2行目：<'a> により引数と戻り値の参照寿命の関連性を宣言しています。",
          "7行目：Highlight<'a> が snippet の参照元（text）より長生きできないことを保証します。",
          '12-14行目：text は main 全体で有効なため、スライス借用は安全に機能します。',
          '16行目："Rustacean" は ' + "`static ライフタイムを持ち、h.snippet と安全な共通期間で返却されます。",
        ],
        pitfall: {
          title: '参照元スコープを抜けた後に参照を使用してしまう（E0597）',
          errorCode: 'error[E0597]: `inner` does not live long enough',
          badCode: `let r;
{
    let inner = String::from("short-lived");
    r = longest("long", inner.as_str()); // inner はここで破棄
}
println!("{}", r); // エラー：r が解放済みの inner を指す可能性`,
          description:
            '`longest` は両方の入力と戻り値を同じ `\'a` で結んでいるため、片方の `inner` がスコープを抜けた時点で `r` の使用も禁止されます。',
          fix: '`inner` を外側のスコープへ移動するか、参照ではなく所有権を持つ `String` を返すように変更します。',
        },
        quiz: {
          question: "関数 `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str` における `'a` の正しい役割はどれですか？",
          options: [
            '引数 x と y のメモリ解放をプログラム終了時まで強制的に遅らせる。',
            '戻り値の参照が、x と y のうち短い方のスコープを超えないという制約をコンパイラに伝える。',
            'ガベージコレクタに両方の文字列を保護させる。',
          ],
          correctIndex: 1,
          explanation:
            'ライフタイム注釈は値の実際の寿命を変えず、入力参照と出力参照の有効期間の交差関係を検証するために使われます。',
          challengePrompt: '構造体にジェネリックライフタイム引数を追加してください：',
          challengePrefix: 'struct Excerpt<',
          challengeKeyword: "'a",
          challengeSuffix: "> { part: &'a str }",
          challengeSuccess: "正解です！`'a` で構造体のライフタイムパラメータを宣言します。",
        },
      },
    },
  },
];
