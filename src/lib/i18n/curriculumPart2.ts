import { CurriculumLesson } from './curriculumTypes';

export const curriculumLessonsPart2: CurriculumLesson[] = [
  {
    slug: 'structs-enums',
    order: 6,
    phaseKey: 'phase2',
    difficultyKey: 'intermediate',
    iconKey: 'boxes',
    visualizerSlug: 'memory-layout',
    prevSlug: 'lifetimes-scopes',
    nextSlug: 'traits-generics',
    translations: {
      zh: {
        title: '结构体、枚举与模式匹配',
        shortTitle: '6. 结构体与模式匹配',
        phase: '第二阶段：深入核心',
        difficulty: '中级',
        duration: '25 分钟',
        summary: '使用结构体封装关联字段，用代数数据类型（Enum）精确建模状态机，并通过穷尽式 match 表达式保证分支零遗漏。',
        tags: ['结构体', '枚举', '模式匹配'],
        overview:
          '结构体（Struct）将相关数据组织为“积类型”（Product Type），而枚举（Enum）则是强大的“和类型”（Sum Type）——每个变体都能携带不同类型的数据载荷。搭配强制穷尽检查的 `match` 表达式，Rust 让无效状态在类型系统层面变得无法表达。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '相比传统面向对象语言的继承层次，Rust 推崇组合与代数数据类型（ADT）。通过 `impl` 块为结构体或枚举绑定关联函数（如 `new` 构造器）与方法（`&self`、`&mut self`、`self`）。',
            bullets: [
              '结构体支持字段初始化简写（Field Init Shorthand）与结构体更新语法（`..other`）',
              '枚举变体可内嵌元组、具名结构体甚至无数据载荷，直接取代易出错的布尔标记组合',
              '`match` 表达式是“穷尽的”（Exhaustive）：忘记处理任何一个枚举变体都会立即编译报错',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '在内存中，结构体字段按其最大对齐要求（Alignment）进行重排与填充（Padding）以提高缓存命中率；而枚举的大小等于“判别式标签（Discriminant）+ 最大变体尺寸”，无需任何堆指针即可在栈上存放多态状态。',
            bullets: [
              'Rust 默认使用 `repr(Rust)`，编译器可自由重排结构体字段以最小化填充字节浪费',
              '空枚举或零大小变体（ZST）配合 `Option<&T>` 可触发“空指针优化”，大小保持与指针相同',
              '若只需要匹配单个变体，可用语法更简洁的 `if let` 或 `let ... else` 提前返回',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '善用模式解构与“让非法状态无法被表示（Make Illegal States Unrepresentable）”原则，能将大量运行时防御性 `if` 判断消灭在编译期。',
            bullets: [
              '用枚举状态机（如 `Connecting` / `Connected(Socket)` / `Closed`）替代多个松散的可选字段',
              '使用 `match` 替代层层嵌套的 `if-else`，新增变体时编译器会自动标出所有待更新位置',
              '为领域核心结构体派生 `#[derive(Debug, Clone, PartialEq)]` 方便测试断言与日志打印',
            ],
          },
        ],
        codeSnippet: `#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

impl Message {
    fn describe(&self) {
        // match 强制穷尽所有变体，且模式匹配可直接解构内部字段
        match self {
            Message::Quit => println!("收到退出信号"),
            Message::Move { x, y } => println!("移动坐标至 ({}, {})", x, y),
            Message::Write(text) => println!("文本消息: {}", text),
        }
    }
}

fn main() {
    let msgs = [
        Message::Move { x: 10, y: 20 },
        Message::Write(String::from("Hello, Rust!")),
        Message::Quit,
    ];
    for msg in &msgs {
        msg.describe();
    }
}`,
        codeExplanation: [
          '第 2-6 行：定义带不同载荷的枚举 Message，比 C 语言枚举拥有更强的类型表达力。',
          '第 11-15 行：match 按引用匹配 &self（触发 Match Ergonomics 自动解引用），解构出 x、y 与 text。',
          '第 20-24 行：数组中存放异构变体，由于枚举体积固定，无需堆分配即可直接放入栈数组。',
          '第 25 行：for msg in &msgs 借用迭代，避免移动数组内元素的所有权。',
        ],
        pitfall: {
          title: '遗漏 match 分支导致非穷尽匹配错误（E0004）',
          errorCode: 'error[E0004]: non-exhaustive patterns: `Message::Quit` not covered',
          badCode: `fn handle(msg: Message) {
    match msg {
        Message::Move { x, y } => println!("{}, {}", x, y),
        Message::Write(s) => println!("{}", s),
        // 忘记处理 Message::Quit！
    }
}`,
          description:
            '当产品需求新增枚举变体或开发者疏忽漏写分支时，传统语言可能在运行时触发 Null 或静默跳过；Rust 则在编译期强制全部覆盖。',
          fix: '显式补全 `Message::Quit => ...` 分支，或仅在确信无需区分剩余变体时使用通配符 `_ => ()`。',
        },
        quiz: {
          question: '当在 Rust 中对一个包含 3 个变体的 `enum` 使用 `match` 表达式时，如果只写了 2 个分支会发生什么？',
          options: [
            '编译器默认忽略第 3 个变体，运行时遇到时返回单元类型 ()。',
            '编译直接报错（E0004），因为 Rust 的 `match` 必须保证模式匹配穷尽所有可能情况。',
            '仅在启用 --release 编译时才会发出警告。',
          ],
          correctIndex: 1,
          explanation:
            'Rust 的 `match` 具有编译期穷尽性检查（Exhaustiveness Checking），保证任何枚举状态变化都不会被静默遗漏。',
          challengePrompt: '填入用于对枚举执行穷尽分支匹配的关键字：',
          challengePrefix: '',
          challengeKeyword: 'match',
          challengeSuffix: ' msg { Message::Quit => println!("bye"), _ => () }',
          challengeSuccess: '回答正确！`match` 是 Rust 中强大的穷尽式模式匹配关键字。',
        },
      },
      en: {
        title: 'Structs, Enums & Pattern Matching',
        shortTitle: '6. Structs & Enums',
        phase: 'Phase 2: Deep Dive',
        difficulty: 'Intermediate',
        duration: '25 min',
        summary: 'Compose custom data structures, algebraic data types with Enums, and exhaustive match statement expressions.',
        tags: ['Structs', 'Enums', 'Pattern Matching'],
        overview:
          'Structs bundle related fields into product types, while Enums act as algebraic sum types where every variant can carry distinct typed payloads. Combined with exhaustive `match` expressions, Rust lets you make invalid program states unrepresentable.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Instead of class inheritance hierarchies, Rust favors composition and Algebraic Data Types (ADTs). Behavior is attached via `impl` blocks defining associated constructors and `&self` / `&mut self` methods.',
            bullets: [
              'Structs support field-init shorthand and struct update syntax (`..base`) cleanly',
              'Enum variants can carry tuples, named fields, or unit tags inside one unified type',
              '`match` expressions are strictly exhaustive—omitting a variant is a compile-time error',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Structs align fields according to their largest member alignment (inserting padding unless reordered by `repr(Rust)`). Enums occupy the size of a discriminant tag plus their largest variant—zero heap indirection required.',
            bullets: [
              'Under default `repr(Rust)`, the Rust compiler reorders struct fields automatically to minimize padding bytes',
              'Null-pointer optimization shrinks `Option<&T>` to the exact byte size of a single pointer',
              'Use `if let` or `let ... else` when matching a single variant cleanly without boilerplate',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Model domain state machines with enums rather than loose boolean flags or nullable fields so the type checker validates state transitions.',
            bullets: [
              'Replace `{ is_connected: bool, socket: Option<TcpStream> }` with an explicit `ConnectionState` enum',
              'Prefer explicit `match` arms over catch-all `_` when adding new variants should flag call sites',
              'Derive `#[derive(Debug, Clone, PartialEq)]` on core domain types for effortless testing',
            ],
          },
        ],
        codeSnippet: `#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

impl Message {
    fn describe(&self) {
        // match guarantees all variants are handled and destructures inner payloads
        match self {
            Message::Quit => println!("Received quit signal"),
            Message::Move { x, y } => println!("Move coordinates to ({}, {})", x, y),
            Message::Write(text) => println!("Text payload: {}", text),
        }
    }
}

fn main() {
    let msgs = [
        Message::Move { x: 10, y: 20 },
        Message::Write(String::from("Hello, Rust!")),
        Message::Quit,
    ];
    for msg in &msgs {
        msg.describe();
    }
}`,
        codeExplanation: [
          'Lines 2-6: `Message` defines three variants with distinct payloads in a single enum.',
          'Lines 11-15: `match self` destructures coordinates and string references cleanly via match ergonomics.',
          'Lines 20-24: Heterogeneous variants sit side-by-side inside a fixed-size stack array.',
          'Line 25: Iterating over `&msgs` borrows each element without moving ownership.',
        ],
        pitfall: {
          title: 'Non-exhaustive match missing an enum variant (E0004)',
          errorCode: 'error[E0004]: non-exhaustive patterns: `Message::Quit` not covered',
          badCode: `fn handle(msg: Message) {
    match msg {
        Message::Move { x, y } => println!("{}, {}", x, y),
        Message::Write(s) => println!("{}", s),
        // Forgot Message::Quit!
    }
}`,
          description:
            'Whenever a new variant is added to an enum, forgetting to update every switch site is a classic source of subtle bugs in other languages. Rust blocks compilation until every variant is covered.',
          fix: 'Add an explicit `Message::Quit => ...` arm (or `_ => ()` only when remaining variants share a fallback).',
        },
        quiz: {
          question: 'What happens if a `match` expression on a 3-variant `enum` only handles 2 variants without a wildcard arm?',
          options: [
            'The compiler silently ignores the 3rd variant and returns `()` at runtime.',
            'Compilation fails with error[E0004] because `match` must exhaustively cover all variants.',
            'It compiles in debug mode and only warns under `--release`.',
          ],
          correctIndex: 1,
          explanation:
            'Rust enforces compile-time exhaustiveness checking on `match`, guaranteeing unhandled enum states never slip into production.',
          challengePrompt: 'Type the Rust keyword used for exhaustive pattern matching:',
          challengePrefix: '',
          challengeKeyword: 'match',
          challengeSuffix: ' msg { Message::Quit => println!("bye"), _ => () }',
          challengeSuccess: 'Valid Rust syntax! `match` performs exhaustive pattern matching.',
        },
      },
      ja: {
        title: '構造体・列挙型・パターンマッチ',
        shortTitle: '6. 構造体とパターンマッチ',
        phase: 'フェーズ 2：深掘り理解',
        difficulty: '中級',
        duration: '25 分',
        summary: 'カスタム構造体の設計、データを持てる代数的データ型（Enum）、網羅的な match パターンマッチを習得します。',
        tags: ['構造体', '列挙型', 'パターンマッチ'],
        overview:
          '構造体（Struct）は関連データをまとめる積型であり、列挙型（Enum）はバリアントごとに異なる型のペイロードを保持できる和型です。網羅性チェックを行う `match` 式と組み合わせることで、不正な状態を型レベルで表現不能にできます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'クラスの継承ではなく、Rust はコンポジションと代数的データ型（ADT）を採用しています。`impl` ブロックを用いて関連関数（コンストラクタ）やメソッド（`&self`, `&mut self`）を実装します。',
            bullets: [
              '構造体はフィールド初期化省略記法や構造体更新構文（`..base`）をサポート',
              '列挙型はタプル型・名前付きフィールド・ユニット型のバリアントを1つの型に統合可能',
              '`match` 式は完全な網羅性（Exhaustiveness）が要求され、1つでも分岐が抜けるとコンパイル不可',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '構造体は各フィールドのアラインメントに従いパディングを挟んで配置されます。列挙型は「判別タグ + 最大バリアントのサイズ」でスタックに収まり、ヒープ確保は不要です。',
            bullets: [
              '既定の `repr(Rust)` ではパディング削減のためコンパイラがフィールド順を自動最適化',
              'ヌルポインタ最適化により `Option<&T>` はポインタ1本分と全く同じサイズに縮小',
              '単一バリアントだけを調べたい場合は `if let` や `let ... else` で簡潔に記述可能',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '複数の bool フラグや Option の組み合わせを列挙型によるステートマシンへ置き換えることで、バグの温床をコンパイル時に排除できます。',
            bullets: [
              '`is_connected` と `Option<Socket>` の組を明示的な `ConnectionState` enum に置換する',
              '新規バリアント追加時に修正漏れを防ぐため、安易なワイルドカード `_` よりも明示分岐を優先',
              '主要な構造体には `#[derive(Debug, Clone, PartialEq)]` を付けてテストを容易にする',
            ],
          },
        ],
        codeSnippet: `#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

impl Message {
    fn describe(&self) {
        // match は全バリアントを網羅し、内部フィールドを安全に分解する
        match self {
            Message::Quit => println!("終了シグナルを受信"),
            Message::Move { x, y } => println!("座標 ({}, {}) へ移動", x, y),
            Message::Write(text) => println!("テキスト: {}", text),
        }
    }
}

fn main() {
    let msgs = [
        Message::Move { x: 10, y: 20 },
        Message::Write(String::from("Hello, Rust!")),
        Message::Quit,
    ];
    for msg in &msgs {
        msg.describe();
    }
}`,
        codeExplanation: [
          '2-6行目：異なるペイロードを持つ3種類のバリアントを1つの Message 列挙型に定義しています。',
          '11-15行目：match により全パターンを網羅しつつ、x, y や text を借用として取り出しています。',
          '20-24行目：固定長配列の中に異なるバリアントをヒープ割り当てなしで格納しています。',
          '25行目：&msgs をイテレートすることで所有権を移動させずにメソッドを呼び出しています。',
        ],
        pitfall: {
          title: 'match でバリアントを1つ書き漏らした場合（E0004）',
          errorCode: 'error[E0004]: non-exhaustive patterns: `Message::Quit` not covered',
          badCode: `fn handle(msg: Message) {
    match msg {
        Message::Move { x, y } => println!("{}, {}", x, y),
        Message::Write(s) => println!("{}", s),
        // Message::Quit の処理が抜けている！
    }
}`,
          description:
            '列挙型に新しいバリアントを追加した際、呼び出し側の分岐更新を忘れると実行時エラーの原因になります。Rust は網羅されていない分岐をコンパイル時に即座に指摘します。',
          fix: '`Message::Quit => ...` を明示的に追加するか、残りをまとめる場合のみ `_ => ()` を記述してください。',
        },
        quiz: {
          question: '3つのバリアントを持つ `enum` に対する `match` 式で、ワイルドカードなしに2つしか分岐を書かなかった場合どうなりますか？',
          options: [
            'コンパイラが3つ目を暗黙的に無視し、実行時にユニット型 `()` を返す。',
            '網羅性チェックによりコンパイルエラー（error[E0004]）が発生する。',
            'デバッグビルドは通り、`--release` 時のみ警告が出る。',
          ],
          correctIndex: 1,
          explanation:
            '`match` はコンパイル時にすべてのパターンが網羅されているかを検証するため、処理漏れが本番コードに混入しません。',
          challengePrompt: '網羅的なパターンマッチングを行う Rust キーワードを入力してください：',
          challengePrefix: '',
          challengeKeyword: 'match',
          challengeSuffix: ' msg { Message::Quit => println!("bye"), _ => () }',
          challengeSuccess: '正解です！`match` キーワードで網羅的なパターンマッチを行います。',
        },
      },
    },
  },
  {
    slug: 'traits-generics',
    order: 7,
    phaseKey: 'phase2',
    difficultyKey: 'intermediate',
    iconKey: 'cpu',
    visualizerSlug: 'trait-dispatch',
    prevSlug: 'structs-enums',
    nextSlug: 'error-handling',
    translations: {
      zh: {
        title: 'Trait 与泛型编程',
        shortTitle: '7. Trait 与泛型编程',
        phase: '第二阶段：深入核心',
        difficulty: '中级',
        duration: '30 分钟',
        summary: '使用 Trait 定义共享行为契约，深入对比编译期单态化静态分发（impl Trait）与运行时虚表动态分发（dyn Trait）。',
        tags: ['Trait', '泛型', '多态分发'],
        overview:
          'Trait 是 Rust 实现抽象与代码复用的基石，相当于带有默认方法实现和关联类型的能力契约。通过泛型约束（Static Dispatch）或 Trait 对象（Dynamic Dispatch），你可以自由在零开销极致性能与异构集合灵活性之间权衡。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '不同于传统继承体系将行为耦合在父类中，Rust 允许通过 `impl Trait for Type` 为任何现有类型或标准库类型（遵循孤儿规则）叠加新能力，实现解耦的组合式多态。',
            bullets: [
              '静态分发（`fn render<T: Draw>(item: &T)`）在编译期为每种具体类型特化生成专属机器码',
              '动态分发（`&dyn Draw` / `Box<dyn Draw>`）使用 16 字节胖指针（数据指针 + VTable 虚表指针）',
              '孤儿规则（Orphan Rule）要求 Trait 或目标类型至少有一个在当前 Crate 中定义，避免冲突',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '泛型单态化（Monomorphization）让抽象具备“零运行时成本”，可被内联优化；而动态分发需通过 `dyn Trait` 满足对象安全（Object Safety / Dyn Compatibility）规则，才能构建异构集合 `Vec<Box<dyn Draw>>`。',
            bullets: [
              '静态分发可直接内联调用，无虚表间接跳转开销，但会略微增大编译后二进制体积',
              '若 Trait 方法返回 `Self` 或包含泛型方法，则不满足对象安全（触发 E0038），无法转为 `dyn Trait`',
              '标准库高频 Trait（Debug、Clone、Iterator、From/Into）构成整个 Rust 生态的互操作语言',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '库 API 优先使用泛型与 `impl Trait` 获得零成本性能；仅在需要存储多种异构插件、减少编译膨胀或运行期热切换实现时使用 `Box<dyn Trait>`。',
            bullets: [
              '使用 `where` 从句整理多个复杂 Trait 约束，显著提升函数签名可读性',
              '返回值位置使用 `-> impl Iterator<Item = i32>` 隐藏复杂闭包/适配器具体类型',
              '能通过 `#[derive(...)]` 自动实现的 Trait 绝不手写样板代码',
            ],
          },
        ],
        codeSnippet: `trait Draw {
    fn draw(&self);
}

struct Circle { radius: f64 }
impl Draw for Circle {
    fn draw(&self) { println!("绘制圆形 r={}", self.radius); }
}

struct Square { side: f64 }
impl Draw for Square {
    fn draw(&self) { println!("绘制正方形 s={}", self.side); }
}

// 静态分发：编译期单态化，零运行时开销
fn render_static(shape: &impl Draw) {
    shape.draw();
}

fn main() {
    let c = Circle { radius: 3.0 };
    render_static(&c);

    // 动态分发：通过胖指针 &dyn Draw 在同一集合中存放异构类型
    let canvas: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 2.0 }),
        Box::new(Square { side: 4.5 }),
    ];
    for shape in &canvas {
        shape.draw(); // 运行时通过 VTable 虚表跳转
    }
}`,
        codeExplanation: [
          '第 1-3 行：定义共享行为契约 Draw trait。',
          '第 16-18 行：impl Draw 触发编译期单态化，为 Circle 生成特化的直接函数调用，可完全内联。',
          '第 25-28 行：Vec<Box<dyn Draw>> 利用 16 字节胖指针容纳不同大小的 Circle 和 Square 实例。',
          '第 30 行：循环调用通过 VTable 虚函数表在运行期动态分派到具体实现。',
        ],
        pitfall: {
          title: '试图将非对象安全的 Trait 用作 dyn Trait（E0038）',
          errorCode: 'error[E0038]: the trait `Cloneable` cannot be made into an object',
          badCode: `trait Cloneable {
    fn clone_me(&self) -> Self; // 返回 Self，大小在编译期未知
}

fn make_box(item: Box<dyn Cloneable>) {} // 报错 E0038！`,
          description:
            '`dyn Trait` 擦除了具体类型的编译期大小信息，因此虚表中的方法不能直接按值返回编译期大小未知的 `Self`，也不能带有额外泛型参数。',
          fix: '将返回值改为 trait 对象 `Box<dyn Cloneable>`，或者通过 `where Self: Sized` 将该方法排除在动态分发之外。',
        },
        quiz: {
          question: '关于 Rust 中静态分发（`impl Trait` / 泛型）与动态分发（`&dyn Trait`）的对比，以下哪项准确？',
          options: [
            '静态分发在运行时需要查询 VTable 虚函数表，因此比动态分发更慢。',
            '静态分发通过编译期单态化实现零运行时开销并支持内联；动态分发通过胖指针和 VTable 支持异构集合。',
            '动态分发会为每一种具体类型复制生成一份独立的机器码函数体。',
          ],
          correctIndex: 1,
          explanation:
            '单态化在编译期展开具体类型以获得零开销性能；而 `&dyn Trait` 利用“数据指针 + 虚表指针”组成的胖指针实现运行期多态与异构集合。',
          challengePrompt: '填入声明动态分发 Trait 对象胖指针所需的关键字：',
          challengePrefix: 'let shapes: Vec<Box<',
          challengeKeyword: 'dyn',
          challengeSuffix: ' Draw>> = vec![];',
          challengeSuccess: 'Syntax 验证通过！`dyn` 显式标识动态分发的 Trait 对象。',
        },
      },
      en: {
        title: 'Traits & Generic Programming',
        shortTitle: '7. Traits & Generics',
        phase: 'Phase 2: Deep Dive',
        difficulty: 'Intermediate',
        duration: '30 min',
        summary: 'Define shared interfaces with Traits, implement trait bounds, monomorphization, and dynamic dispatch via dyn Trait.',
        tags: ['Traits', 'Generics', 'Polymorphism'],
        overview:
          'Traits define shared behavior contracts across disparate types, serving as Rust’s foundation for generic abstraction. By choosing between monomorphized static dispatch (`impl Trait`) and vtable-backed dynamic dispatch (`dyn Trait`), you control binary size versus runtime indirection.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Unlike class inheritance, Traits decouple data layout from shared capabilities. Any struct or enum can implement existing or custom traits cleanly, governed only by the coherence (orphan) rule.',
            bullets: [
              'Static dispatch (`fn render<T: Draw>(x: &T)`) generates specialized code per concrete type',
              'Dynamic dispatch (`&dyn Draw`) uses a 16-byte fat pointer: (data pointer, vtable pointer)',
              'The orphan rule prevents conflicting implementations by requiring local crate ownership',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Monomorphization gives generics zero runtime cost and unlocks aggressive LLVM inlining. Meanwhile, `dyn Trait` enforces Object Safety rules so heterogeneous collections like `Vec<Box<dyn Draw>>` work safely.',
            bullets: [
              'Static dispatch invokes direct assembly targets with zero vtable dereference',
              'Methods returning `Self` or carrying type parameters violate object safety (error[E0038])',
              'Standard traits (`Debug`, `Clone`, `Iterator`, `From`) power seamless library interop',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Default to generics and `impl Trait` for fast library APIs, and switch to `Box<dyn Trait>` when storing heterogeneous plugins or trimming compile times.',
            bullets: [
              'Use `where` clauses to keep multi-bound generic signatures readable',
              'Return `-> impl Iterator<Item = ...>` to avoid exposing complex iterator adapter types',
              'Use `#[derive(...)]` wherever possible instead of hand-writing boilerplate impls',
            ],
          },
        ],
        codeSnippet: `trait Draw {
    fn draw(&self);
}

struct Circle { radius: f64 }
impl Draw for Circle {
    fn draw(&self) { println!("Drawing circle r={}", self.radius); }
}

struct Square { side: f64 }
impl Draw for Square {
    fn draw(&self) { println!("Drawing square s={}", self.side); }
}

// Static dispatch: monomorphized at compile time (zero runtime cost)
fn render_static(shape: &impl Draw) {
    shape.draw();
}

fn main() {
    let c = Circle { radius: 3.0 };
    render_static(&c);

    // Dynamic dispatch: heterogeneous collection via fat pointer & VTable
    let canvas: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 2.0 }),
        Box::new(Square { side: 4.5 }),
    ];
    for shape in &canvas {
        shape.draw();
    }
}`,
        codeExplanation: [
          'Lines 1-3: Declares the shared `Draw` behavior contract.',
          'Lines 16-18: `impl Draw` monomorphizes per concrete type, enabling direct inline calls.',
          'Lines 25-28: `Vec<Box<dyn Draw>>` stores mixed concrete types behind 16-byte fat pointers.',
          'Line 30: `shape.draw()` dispatches via the runtime VTable entry.',
        ],
        pitfall: {
          title: 'Using a non-object-safe Trait as dyn Trait (E0038)',
          errorCode: 'error[E0038]: the trait `Cloneable` cannot be made into an object',
          badCode: `trait Cloneable {
    fn clone_me(&self) -> Self; // Returns Self (unsized behind dyn)
}

fn make_box(item: Box<dyn Cloneable>) {} // Error E0038!`,
          description:
            '`dyn Trait` erases the concrete type’s compile-time size, so vtable-dispatched methods cannot return `Self` by value or introduce generic method parameters.',
          fix: 'Return `Box<dyn Cloneable>` instead, or restrict the method with `where Self: Sized` so it is omitted from the vtable.',
        },
        quiz: {
          question: 'Which statement accurately compares static dispatch (`impl Trait`) and dynamic dispatch (`&dyn Trait`)?',
          options: [
            'Static dispatch looks up a runtime VTable and is slower than dynamic dispatch.',
            'Static dispatch monomorphizes at compile time with zero runtime cost; dynamic dispatch uses fat pointers and VTables for heterogeneous collections.',
            'Dynamic dispatch duplicates machine code for every concrete type at compile time.',
          ],
          correctIndex: 1,
          explanation:
            'Monomorphization generates specialized direct calls with zero indirection, whereas `&dyn Trait` pairs a data pointer with a VTable pointer for runtime polymorphism.',
          challengePrompt: 'Type the keyword required to declare a dynamic dispatch trait object:',
          challengePrefix: 'let shapes: Vec<Box<',
          challengeKeyword: 'dyn',
          challengeSuffix: ' Draw>> = vec![];',
          challengeSuccess: 'Valid Rust syntax! `dyn` explicitly denotes a trait object.',
        },
      },
      ja: {
        title: 'トレイトとジェネリックプログラミング',
        shortTitle: '7. トレイトとジェネリクス',
        phase: 'フェーズ 2：深掘り理解',
        difficulty: '中級',
        duration: '30 分',
        summary: 'トレイトによる共通インターフェース定義、静的ディスパッチ（単態化）と動的ディスパッチ（vtable）の違いを学びます。',
        tags: ['トレイト', 'ジェネリクス', 'ポリモーフィズム'],
        overview:
          'トレイト（Trait）は型を横断して共通の振る舞いを定義する契約です。コンパイル時単態化による静的ディスパッチ（`impl Trait`）と、vtable を使った動的ディスパッチ（`dyn Trait`）を自在に使い分けられます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'クラス継承とは異なり、Rust のトレイトはデータ構造と振る舞いを分離します。孤児ルール（Orphan Rule）の範囲内で既存の型にも新しいトレイトを実装できます。',
            bullets: [
              '静的ディスパッチ（`fn render<T: Draw>(x: &T)`）は具象型ごとに最適化コードを自動生成',
              '動的ディスパッチ（`&dyn Draw`）はデータポインタ＋vtable ポインタの16バイトファットポインタ',
              '孤児ルールにより外部クレート同士のトレイト実装衝突をコンパイル時に防止',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '単態化（Monomorphization）によりジェネリクスは実行時コストゼロでインライン展開されます。一方 `dyn Trait` を使うにはオブジェクト安全性（Object Safety）の条件を満たす必要があります。',
            bullets: [
              '静的ディスパッチは直接呼び出しで最速ですが、バイナリサイズが増加する場合があります',
              'メソッドが値として `Self` を返す場合などは E0038（オブジェクト安全違反）となります',
              '`Debug`, `Clone`, `Iterator`, `From` などの標準トレイトがエコシステム全体の連携を支えます',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '基本はゼロコストのジェネリクス／`impl Trait` を使い、異なる型を1つのコレクションに入れたい場合のみ `Box<dyn Trait>` を選びましょう。',
            bullets: [
              '複雑なトレイト境界は `where` 句で整理して可読性を高めます',
              '戻り値型 `-> impl Iterator<Item = ...>` により複雑なイテレータ型を隠蔽できます',
              '標準トレイトは手書きせず積極的に `#[derive(...)]` を活用します',
            ],
          },
        ],
        codeSnippet: `trait Draw {
    fn draw(&self);
}

struct Circle { radius: f64 }
impl Draw for Circle {
    fn draw(&self) { println!("円を描画 r={}", self.radius); }
}

struct Square { side: f64 }
impl Draw for Square {
    fn draw(&self) { println!("正方形を描画 s={}", self.side); }
}

// 静的ディスパッチ：コンパイル時に単態化されオーバーヘッドゼロ
fn render_static(shape: &impl Draw) {
    shape.draw();
}

fn main() {
    let c = Circle { radius: 3.0 };
    render_static(&c);

    // 動的ディスパッチ：異なる型をファットポインタ経由で同じ Vec に格納
    let canvas: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 2.0 }),
        Box::new(Square { side: 4.5 }),
    ];
    for shape in &canvas {
        shape.draw();
    }
}`,
        codeExplanation: [
          '1-3行目：共通インターフェースとなる Draw トレイトを定義します。',
          '16-18行目：impl Draw により呼び出し元の型に応じて直接呼び出しへ単態化されます。',
          '25-28行目：Vec<Box<dyn Draw>> によりサイズの異なる Circle と Square を混在管理できます。',
          '30行目：実行時に vtable を経由して適切なメソッドへジャンプします。',
        ],
        pitfall: {
          title: 'オブジェクト安全でないトレイトを dyn Trait にしようとした場合（E0038）',
          errorCode: 'error[E0038]: the trait `Cloneable` cannot be made into an object',
          badCode: `trait Cloneable {
    fn clone_me(&self) -> Self; // サイズ不定の Self を値で返している
}

fn make_box(item: Box<dyn Cloneable>) {} // E0038 エラー！`,
          description:
            '`dyn Trait` は元の型のサイズ情報を消去するため、戻り値に `Self` を直接返すメソッドやジェネリックメソッドを持つトレイトはトレイトオブジェクト化できません。',
          fix: '`Box<dyn Cloneable>` を返すように変更するか、`where Self: Sized` 境界を付けて動的ディスパッチ対象から外します。',
        },
        quiz: {
          question: '静的ディスパッチ（`impl Trait`）と動的ディスパッチ（`&dyn Trait`）を比較した正しい説明はどれですか？',
          options: [
            '静的ディスパッチは実行時に vtable を参照するため動的ディスパッチより遅い。',
            '静的ディスパッチはコンパイル時単態化により実行時コストがゼロであり、動的ディスパッチはファットポインタと vtable により異種コレクションを扱える。',
            '動的ディスパッチは型ごとに機械語関数を複製してバイナリサイズを拡大させる。',
          ],
          correctIndex: 1,
          explanation:
            '単態化は直接呼び出しとインライン化によるゼロコスト抽象化を実現し、`&dyn Trait` は実行時ポリモーフィズムを提供します。',
          challengePrompt: '動的ディスパッチのトレイトオブジェクトを明示するキーワードを入力してください：',
          challengePrefix: 'let shapes: Vec<Box<',
          challengeKeyword: 'dyn',
          challengeSuffix: ' Draw>> = vec![];',
          challengeSuccess: '正しい Rust 構文です！`dyn` はトレイトオブジェクトを明示します。',
        },
      },
    },
  },
  {
    slug: 'error-handling',
    order: 8,
    phaseKey: 'phase2',
    difficultyKey: 'intermediate',
    iconKey: 'zap',
    visualizerSlug: 'railway-errors',
    prevSlug: 'traits-generics',
    nextSlug: 'smart-pointers',
    translations: {
      zh: {
        title: '铁路错误处理：Option 与 Result',
        shortTitle: '8. 错误处理与 Result',
        phase: '第二阶段：深入核心',
        difficulty: '中级',
        duration: '25 分钟',
        summary: '使用 Option<T> and Result<T, E> 彻底告别空指针异常与隐式异常抛栈，借助 ? 传播运算符打造清晰的铁路流管道。',
        tags: ['Option', 'Result', '错误处理'],
        overview:
          'Rust 没有 `null` 也没有隐藏的 try/catch 异常抛栈，而是将“值可能缺失”（`Option<T>`）和“操作可能失败”（`Result<T, E>`）编码进返回值类型中。配合 `?` 运算符与铁路导向编程模型，正常路径与错误分流一目了然。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '把返回 `Result<T, E>` 的调用链想象成双轨铁路：绿色轨道代表 `Ok(val)` 一路畅通向下游转换；一旦某一步返回 `Err(e)`，操作符 `?` 会立即切换至红色错误轨道提前返回（Early Return）。',
            bullets: [
              '`Option<T>` 只有 `Some(T)` 与 `None` 两个变体，从语言层面消灭 NullPointerException',
              '`Result<T, E>` 强制调用者显式处理 `Ok(T)` 或 `Err(E)`，不可静默忽略失败状态',
              '`?` 运算符既可提前返回错误，又会自动调用 `From::from` 完成底层错误类型转换',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              'Rust 将错误严格分为两类：可恢复错误（使用 `Result`）与不可恢复逻辑 Bug（使用 `panic!`）。编译期 `#[must_use]` 属性会直接警告未处理的 `Result` 返回值。',
            bullets: [
              '在 `main` 或库函数中尽量避免直接 `.unwrap()`，改用 `?`、`.unwrap_or_default()` 或 `match`',
              '`.expect("上下文说明")` 比 `.unwrap()` 更好，能在原型阶段提供清晰的故障诊断提示',
              '`Option::map`、`and_then`、`ok_or` 等组合子允许零缩进地串联纯函数流水线',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '在业务应用与库开发中建立清晰的错误边界：应用程序可用 `anyhow` 快速附加上下文，而公共库推荐使用 `thiserror` 导出强类型错误枚举。',
            bullets: [
              '自定义 `AppError` 枚举并为底层 IO/Parse 错误实现 `From` trait，让 `?` 无缝串联不同模块',
              '只在真正无法继续的契约违背或测试断言处使用 `panic!`，网络/文件错误一律返回 `Result`',
              '利用 `let Some(val) = opt else { return ... };` 编写极度扁平的卫语句',
            ],
          },
        ],
        codeSnippet: `use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    MissingKey,
    InvalidPort(ParseIntError),
}

// 实现 From 后，? 运算符会自动将 ParseIntError 转换为 ConfigError
impl From<ParseIntError> for ConfigError {
    fn from(err: ParseIntError) -> Self {
        ConfigError::InvalidPort(err)
    }
}

fn parse_port(raw: Option<&str>) -> Result<u16, ConfigError> {
    let text = raw.ok_or(ConfigError::MissingKey)?; // None -> 切换至 Err 轨提前返回
    let port: u16 = text.trim().parse()?;          // ParseIntError -> 自动 From 转换
    Ok(port)
}

fn main() {
    println!("正常解析: {:?}", parse_port(Some("8080")));
    println!("缺失键: {:?}", parse_port(None));
    println!("非法端口: {:?}", parse_port(Some("abc")));
}`,
        codeExplanation: [
          '第 10-14 行：实现 From<ParseIntError>，赋予 ? 运算符自动升级底层错误类型的能力。',
          '第 17 行：.ok_or(...) 将 Option<&str> 转为 Result，若为 None 立即经由 ? 短路返回 MissingKey。',
          '第 18 行：.parse()? 解析失败时自动调用 From::from 包装为 ConfigError::InvalidPort。',
          '第 23-25 行：三条测试用例分别走通绿色 Ok 轨道与两条红色 Err 轨道，程序全程零 panic。',
        ],
        pitfall: {
          title: '在返回值非 Result/Option 的函数中使用 ? 运算符（E0277）',
          errorCode: 'error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option`',
          badCode: `fn load_config() {
    let content = std::fs::read_to_string("app.toml")?; // load_config 返回 ()！
}`,
          description:
            '`?` 运算符的本质是向当前函数调用栈返回 `Err` 或 `None`，因此当前函数的签名必须兼容对应的返回类型。',
          fix: '将函数签名改为 `fn load_config() -> Result<String, std::io::Error>`（`main()` 也可以返回 `Result<(), Box<dyn std::error::Error>>`！）。',
        },
        quiz: {
          question: '在返回 `Result<T, AppError>` 的函数内部使用 `?` 运算符传播底层的 `std::io::Error` 时，需要满足什么条件？',
          options: [
            '`AppError` 实现了 `From<std::io::Error>`（或本身就是 `std::io::Error`），以便 `?` 自动转换并提前返回。',
            '`AppError` 必须派生 `Copy` trait 并开启 unsafe 块。',
            '`?` 运算符会自动捕获并丢弃所有错误，始终返回 `Ok` 默认值。',
          ],
          correctIndex: 0,
          explanation:
            '`?` 运算符遇到 `Err(e)` 时会调用 `From::from(e)` 自动转换为目标错误类型并立即提前返回。',
          challengePrompt: '填入用于短路传播 Result 或 Option 错误的运算符：',
          challengePrefix: 'let file = std::fs::read_to_string("Cargo.toml")',
          challengeKeyword: '?',
          challengeSuffix: ';',
          challengeSuccess: 'Syntax 验证通过！`?` 运算符让铁路错误传播简洁无比。',
        },
      },
      en: {
        title: 'Railway Error Handling: Option & Result',
        shortTitle: '8. Error Handling',
        phase: 'Phase 2: Deep Dive',
        difficulty: 'Intermediate',
        duration: '25 min',
        summary: 'Say goodbye to null pointer exceptions with Option<T> and Result<T, E>, using the ? propagation operator seamlessly.',
        tags: ['Option', 'Result', 'Error Handling'],
        overview:
          'Rust eliminates null pointers and hidden exceptions by modeling absence (`Option<T>`) and recoverable failure (`Result<T, E>`) directly in the type system. Using railway-oriented combinators and the `?` operator keeps happy paths clean while making every failure explicit.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Visualize `Result<T, E>` pipelines as a two-track railway: `Ok(val)` rides the green success track through every step, while returning `Err(e)` diverts onto the red failure track via `?` early return.',
            bullets: [
              '`Option<T>` encodes presence (`Some(T)`) vs absence (`None`) without null-pointer crashes',
              '`Result<T, E>` marks `#[must_use]`, reminding callers to handle errors explicitly',
              'The `?` operator unwraps `Ok`/`Some` or converts via `From::from` and returns early on error',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Rust distinguishes recoverable errors (`Result`) from unrecoverable logic bugs (`panic!`). Enum combinators compile down to simple branch instructions with zero exception-table runtime penalty.',
            bullets: [
              'Avoid bare `.unwrap()` in production paths; reach for `?`, `match`, or `.unwrap_or_else()`',
              'Use `.expect("context")` during prototyping to document why an invariant holds',
              'Chain `.map()`, `.and_then()`, and `.ok_or()` for flat, expressive transformations',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Design ergonomic error enums implementing `From` for seamless `?` propagation across IO, parsing, and network boundaries.',
            bullets: [
              'Use `thiserror` in reusable libraries and `anyhow` in top-level binaries for rich context',
              'Reserve `panic!` strictly for violated invariants; return `Result` for external I/O failures',
              'Use `let Some(x) = opt else { return ... };` for concise early-exit guards',
            ],
          },
        ],
        codeSnippet: `use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    MissingKey,
    InvalidPort(ParseIntError),
}

// Implementing From lets the ? operator convert ParseIntError automatically
impl From<ParseIntError> for ConfigError {
    fn from(err: ParseIntError) -> Self {
        ConfigError::InvalidPort(err)
    }
}

fn parse_port(raw: Option<&str>) -> Result<u16, ConfigError> {
    let text = raw.ok_or(ConfigError::MissingKey)?; // None -> Err track
    let port: u16 = text.trim().parse()?;          // ParseIntError -> ConfigError via From
    Ok(port)
}

fn main() {
    println!("Valid port: {:?}", parse_port(Some("8080")));
    println!("Missing key: {:?}", parse_port(None));
    println!("Bad number: {:?}", parse_port(Some("abc")));
}`,
        codeExplanation: [
          'Lines 10-14: Implementing `From<ParseIntError>` allows `?` to convert parse failures automatically.',
          'Line 17: `.ok_or(...)` bridges `Option<&str>` into `Result`, short-circuiting `None` to `MissingKey`.',
          'Line 18: `.parse()?` converts any `ParseIntError` into `ConfigError::InvalidPort`.',
          'Lines 23-25: Exercises both success and failure railway tracks with zero panics.',
        ],
        pitfall: {
          title: 'Using the ? operator inside a function returning () (E0277)',
          errorCode: 'error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option`',
          badCode: `fn load_config() {
    let content = std::fs::read_to_string("app.toml")?; // returns ()!
}`,
          description:
            'Because `?` expands to an early `return Err(...)`, the enclosing function signature must itself return a compatible `Result` or `Option`.',
          fix: 'Update the return type, e.g. `fn load_config() -> Result<String, std::io::Error>` (`main()` supports `Result` too!).',
        },
        quiz: {
          question: 'What enables the `?` operator inside a `Result<T, AppError>` function to propagate a `std::io::Error`?',
          options: [
            '`AppError` implements `From<std::io::Error>`, allowing `?` to convert and return early.',
            '`AppError` must derive `Copy` inside an `unsafe` block.',
            '`?` catches and ignores errors by returning a default `Ok` value.',
          ],
          correctIndex: 0,
          explanation:
            'When `?` encounters `Err(e)`, it applies `From::from(e)` to convert the error into the function’s return error type and returns early.',
          challengePrompt: 'Type the Rust propagation operator that short-circuits Result or Option errors:',
          challengePrefix: 'let file = std::fs::read_to_string("Cargo.toml")',
          challengeKeyword: '?',
          challengeSuffix: ';',
          challengeSuccess: 'Valid Rust syntax! `?` propagates errors cleanly along the railway track.',
        },
      },
      ja: {
        title: '鉄道エラー処理：Option と Result',
        shortTitle: '8. エラー処理と Result',
        phase: 'フェーズ 2：深掘り理解',
        difficulty: '中級',
        duration: '25 分',
        summary: 'Option<T> and Result<T, E> によって Null 例外を根絶し、? 演算子による明快な鉄道型エラー伝播フローを学びます。',
        tags: ['Option', 'Result', 'エラー処理'],
        overview:
          'Rust には `null` も隠れた例外送出もありません。値の不在は `Option<T>`、回復可能な失敗は `Result<T, E>` として型に組み込まれ、`?` 演算子による「2軌道鉄道モデル」で正常系と異常系を簡潔に記述できます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              '`Result<T, E>` の処理パイプラインは複線の鉄道に例えられます。`Ok(val)` は緑色の正常路線を直進し、`Err(e)` が発生した瞬間に `?` 演算子がポイントを切り替えて赤色のエラー路線から即座に早期リターンします。',
            bullets: [
              '`Option<T>` は `Some(T)` と `None` だけで値の有無を表し、Null ポインタ例外を排除',
              '`Result<T, E>` は呼び出し側に対処を強制し、エラーの握りつぶしを防止',
              '`?` 演算子はエラー時に早期リターンする際、`From::from` で型変換も自動実行',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              'Rust は回復可能なエラー（`Result`）と回復不能なバグ（`panic!`）を明確に区別します。例外テーブルの実行時コストは一切かかりません。',
            bullets: [
              '本番コードでは安易な `.unwrap()` を避け、`?` や `match`, `.unwrap_or_else()` を使用',
              '`.expect("理由")` を使えば、万一パニックした際に文脈情報が得られます',
              '`.map()`, `.and_then()`, `.ok_or()` などのコンビネータでネストのない変換を記述可能',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '独自のエラー型に `From` トレイトを実装しておくことで、I/O やパースなど異なる種類の失敗を `?` だけで統一的に伝播できます。',
            bullets: [
              'ライブラリ開発では `thiserror`、アプリケーション開発では `anyhow` の活用が定番です',
              'ネットワークやファイルエラーは必ず `Result` で返し、契約違反のみ `panic!` させます',
              '`let Some(x) = opt else { return ... };` 構文でフラットなガード節を書けます',
            ],
          },
        ],
        codeSnippet: `use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    MissingKey,
    InvalidPort(ParseIntError),
}

// From 実装により ? 演算子が ParseIntError を自動変換できる
impl From<ParseIntError> for ConfigError {
    fn from(err: ParseIntError) -> Self {
        ConfigError::InvalidPort(err)
    }
}

fn parse_port(raw: Option<&str>) -> Result<u16, ConfigError> {
    let text = raw.ok_or(ConfigError::MissingKey)?; // None なら即座に Err 路線へ
    let port: u16 = text.trim().parse()?;          // ParseIntError を ConfigError へ変換
    Ok(port)
}

fn main() {
    println!("正常ポート: {:?}", parse_port(Some("8080")));
    println!("キー欠損: {:?}", parse_port(None));
    println!("不正文字列: {:?}", parse_port(Some("abc")));
}`,
        codeExplanation: [
          '10-14行目：From<ParseIntError> を実装することで ? による暗黙的エラー型変換が可能になります。',
          '17行目：.ok_or(...) で Option を Result へ橋渡しし、None 時は即座に MissingKey を返却します。',
          '18行目：.parse()? が失敗した場合、自動的に ConfigError::InvalidPort へ変換して早期リターンします。',
          '23-25行目：正常系と異常系の両方をパニックなしで安全に処理しています。',
        ],
        pitfall: {
          title: 'Result や Option を返さない関数で ? 演算子を使ってしまう（E0277）',
          errorCode: 'error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option`',
          badCode: `fn load_config() {
    let content = std::fs::read_to_string("app.toml")?; // 戻り値が ()！
}`,
          description:
            '`?` は失敗時に呼び出し元へ `Err` または `None` を早期リターンするため、囲む関数の戻り値型も互換性のある `Result` か `Option` でなければなりません。',
          fix: '関数シグネチャを `fn load_config() -> Result<String, std::io::Error>` のように修正します（`main()` でも返却可能です）。',
        },
        quiz: {
          question: '`Result<T, AppError>` を返す関数内で `std::io::Error` に対して `?` 演算子を使うために必要な条件はどれですか？',
          options: [
            '`AppError` が `From<std::io::Error>` を実装していること（または同じエラー型であること）。',
            '`AppError` が `Copy` を導出し、`unsafe` ブロックで囲まれていること。',
            '`?` 演算子がすべてのエラーを握りつぶし、常にデフォルトの `Ok` を返すこと。',
          ],
          correctIndex: 0,
          explanation:
            '`?` 演算子は `Err(e)` に遭遇すると `From::from(e)` を呼び出して戻り値型へ変換し、即座に早期リターンします。',
          challengePrompt: 'Result や Option のエラーを早期リターンで伝播する演算子を入力してください：',
          challengePrefix: 'let file = std::fs::read_to_string("Cargo.toml")',
          challengeKeyword: '?',
          challengeSuffix: ';',
          challengeSuccess: '正解です！`?` 演算子で鉄道エラー伝播を簡潔に書けます。',
        },
      },
    },
  },
  {
    slug: 'smart-pointers',
    order: 9,
    phaseKey: 'phase3',
    difficultyKey: 'advanced',
    iconKey: 'lock',
    visualizerSlug: 'ownership',
    prevSlug: 'error-handling',
    nextSlug: 'concurrency-mutex',
    translations: {
      zh: {
        title: '智能指针：Box、Rc、Arc 与 RefCell',
        shortTitle: '9. 智能指针 (Box/Rc/Arc)',
        phase: '第三阶段：高阶精通',
        difficulty: '高级',
        duration: '35 分钟',
        summary: '深入理解 Box<T> 堆分配、Rc<T> 单线程共享所有权、Arc<T> 原子跨线程引用计数与 RefCell<T> 运行时内部可变性。',
        tags: ['智能指针', 'Box', 'Arc', 'RefCell'],
        overview:
          '当单一静态所有者无法表达树/图结构、递归类型或跨线程共享状态时，智能指针便登上舞台。它们通过实现 `Deref` 与 `Drop` trait 扩展所有权模型，同时严格守卫内存与线程安全边界。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '每种智能指针都对应明确的所有权与可变性组合：`Box<T>` 提供单一堆所有权；`Rc<T>` 允许单线程内多个只读共享所有者；`Arc<T>` 通过原子操作实现线程安全共享；`RefCell<T>` 则将借用规则推迟到运行时动态检查。',
            bullets: [
              '`Box<T>` 常用于定义递归类型（如链表 `Cons(i32, Box<List>)`）及大型数据免拷贝转移',
              '`Rc::clone(&ptr)` 仅将引用计数器加 1（O(1)），完全不克隆底层堆数据',
              '`Arc<T>` 使用原子加减计数器，开销略高于 `Rc`，但实现了 `Send + Sync` 可跨线程共享',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '`RefCell<T>` 提供“内部可变性”（Interior Mutability）：即使外层句柄不可变，内部仍可通过 `.borrow()` 或 `.borrow_mut()` 获取租约，但违反互斥规则会在运行时直接 panic。',
            bullets: [
              '试图将非线程安全的 `Rc<RefCell<T>>` 发送到新线程会触发编译期错误 E0277（未实现 Send）',
              '`Rc` 循环引用会导致计数无法归零（内存泄漏），需使用 `Weak<T>` 弱引用打破环路',
              '单线程多所有者可变状态用 `Rc<RefCell<T>>`，多线程场景则升级为 `Arc<Mutex<T>>`',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '不要一上来就堆砌 `Rc<RefCell<T>>`，优先通过所有权设计与索引/ID 解决图结构；仅在真正需要共享树节点或 Mock 测试替身时引入。',
            bullets: [
              '尽量缩小 `refcell.borrow_mut()` 返回的 `RefMut` 守卫生命周期，避免在同一调用链二次借用 panic',
              '树形结构中父节点用 `Rc` 指向子节点，子节点回指父节点务必使用 `Weak` 避免内存泄漏',
              '跨线程只读共享配置对象时，优先使用轻量的 `Arc<Config>`，无需套一层多余的 `Mutex`',
            ],
          },
        ],
        codeSnippet: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    // Box<T>：单一所有权堆分配，适合递归结构或 trait 对象
    let boxed_val = Box::new(42);
    println!("Box 值: {}", boxed_val);

    // Rc<RefCell<T>>：单线程内多个所有者安全共享并修改同一份状态
    let shared_log = Rc::new(RefCell::new(vec!["init".to_string()]));
    let observer_a = Rc::clone(&shared_log);
    let observer_b = Rc::clone(&shared_log);

    observer_a.borrow_mut().push("event_1".to_string());
    observer_b.borrow_mut().push("event_2".to_string());

    println!("共享日志数量: {}, 内容: {:?}", Rc::strong_count(&shared_log), shared_log.borrow());
}`,
        codeExplanation: [
          '第 6 行：Box::new(42) 在堆上分配整数并在作用域结束时自动释放。',
          '第 10-12 行：Rc::clone 仅增加引用计数（strong_count 变为 3），共享同一块堆内存。',
          '第 14-15 行：通过 RefCell::borrow_mut() 获取临时独占可变借用，分号结束后守卫立即 Drop 释放。',
          '第 17 行：两个共享句柄的修改结果全部反映在同一向量中。',
        ],
        pitfall: {
          title: '在同一作用域内同时持有两个 RefCell 可变借用导致运行时 Panic',
          errorCode: 'thread \'main\' panicked at \'already borrowed: BorrowMutError\'',
          badCode: `use std::cell::RefCell;

let cell = RefCell::new(10);
let mut b1 = cell.borrow_mut();
let mut b2 = cell.borrow_mut(); // 运行时 Panic！同时存在两个活跃可变借用
*b1 += 1;
*b2 += 1;`,
          description:
            '`RefCell<T>` 并没有绕过借用规则，而是把检查从编译期推迟到运行时。只要前一个 `RefMut` 守卫尚未 Drop，再次调用 `borrow_mut()` 就会立即触发 panic。',
          fix: '显式使用代码块 `{ let mut b1 = cell.borrow_mut(); *b1 += 1; }` 提前释放第一个借用守卫，或调用 `drop(b1)` 后再借用 `b2`。',
        },
        quiz: {
          question: '当需要将一份共享的只读配置数据安全地传递给多个并发 OS 线程同时读取时，应该选择哪种智能指针？',
          options: [
            'Rc<T>',
            'Arc<T>',
            'RefCell<T>',
          ],
          correctIndex: 1,
          explanation:
            '`Arc<T>`（Atomically Reference Counted）使用原子指令更新引用计数，实现了 `Send` 与 `Sync` trait，可安全跨线程共享；而 `Rc<T>` 仅限单线程使用。',
          challengePrompt: '填入用于线程安全原子引用计数的智能指针类型名：',
          challengePrefix: 'let shared = ',
          challengeKeyword: 'Arc',
          challengeSuffix: '::new(config);',
          challengeSuccess: '回答正确！`Arc<T>` 通过原子计数支持跨线程共享所有权。',
        },
      },
      en: {
        title: 'Smart Pointers: Box, Rc, Arc & RefCell',
        shortTitle: '9. Smart Pointers',
        phase: 'Phase 3: Mastery',
        difficulty: 'Advanced',
        duration: '35 min',
        summary: 'Explore heap allocation via Box<T>, reference counting with Rc<T>, thread-safe Arc<T>, and interior mutability with RefCell.',
        tags: ['Smart Pointers', 'Box', 'Arc', 'RefCell'],
        overview:
          'When static single-owner rules cannot express recursive structures, graphs, or shared state, Rust’s smart pointers step in. Implementing `Deref` and `Drop`, `Box`, `Rc`, `Arc`, and `RefCell` extend ownership cleanly without sacrificing safety.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Each smart pointer encodes an exact trade-off: `Box<T>` provides sole heap ownership; `Rc<T>` grants shared single-threaded ownership; `Arc<T>` upgrades reference counting to atomic thread-safety; `RefCell<T>` enforces borrow rules dynamically at runtime.',
            bullets: [
              '`Box<T>` enables recursive types (`Cons(i32, Box<List>)`) and trait objects (`Box<dyn Trait>`)',
              '`Rc::clone(&ptr)` increments an integer counter in O(1) without duplicating heap data',
              '`Arc<T>` uses atomic instructions, implementing `Send + Sync` when `T` is thread-safe',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              '`RefCell<T>` unlocks interior mutability behind an immutable outer handle, panicking if overlapping mutable borrows occur at runtime. Trying to send `Rc<T>` across threads fails to compile (error[E0277]).',
            bullets: [
              'Sending `Rc<RefCell<T>>` across `std::thread::spawn` triggers `Send` trait bound errors',
              'Break reference cycles in graphs using `Weak<T>` (`Rc::downgrade`) to prevent memory leaks',
              'Combine `Rc<RefCell<T>>` for single-thread mutation or `Arc<Mutex<T>>` across threads',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Keep `RefMut` guards short-lived to avoid runtime borrow panics, and prefer `Arc<T>` alone when shared cross-thread data is read-only.',
            bullets: [
              'Scope `.borrow_mut()` blocks tightly or call `drop(guard)` before nested calls',
              'Parent-to-child links use `Rc`, while child-to-parent back-pointers should use `Weak`',
              'Only wrap `Arc<T>` inside a `Mutex<T>` when threads actually need to mutate the shared value',
            ],
          },
        ],
        codeSnippet: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    // Box<T>: single-owner heap allocation
    let boxed_val = Box::new(42);
    println!("Box value: {}", boxed_val);

    // Rc<RefCell<T>>: multiple single-thread owners mutating shared state
    let shared_log = Rc::new(RefCell::new(vec!["init".to_string()]));
    let observer_a = Rc::clone(&shared_log);
    let observer_b = Rc::clone(&shared_log);

    observer_a.borrow_mut().push("event_1".to_string());
    observer_b.borrow_mut().push("event_2".to_string());

    println!("Owners: {}, Log: {:?}", Rc::strong_count(&shared_log), shared_log.borrow());
}`,
        codeExplanation: [
          'Line 6: `Box::new(42)` allocates an integer on the heap and frees it at scope exit.',
          'Lines 10-12: `Rc::clone` increments the reference count to 3 without copying the vector.',
          'Lines 14-15: `borrow_mut()` grants temporary exclusive access that drops at the semicolon.',
          'Line 17: Both owners mutate the exact same underlying vector safely.',
        ],
        pitfall: {
          title: 'Holding overlapping RefCell mutable borrows causes a runtime panic',
          errorCode: 'thread \'main\' panicked at \'already borrowed: BorrowMutError\'',
          badCode: `use std::cell::RefCell;

let cell = RefCell::new(10);
let mut b1 = cell.borrow_mut();
let mut b2 = cell.borrow_mut(); // Runtime panic!
*b1 += 1;
*b2 += 1;`,
          description:
            '`RefCell<T>` does not bypass Rust’s aliasing rules—it shifts enforcement from compile time to runtime. Requesting a second mutable borrow before the first guard drops panics immediately.',
          fix: 'End the first borrow scope with `{ let mut b1 = cell.borrow_mut(); *b1 += 1; }` or call `drop(b1)` before calling `borrow_mut()` again.',
        },
        quiz: {
          question: 'Which smart pointer should you choose to share read-only configuration across multiple OS threads?',
          options: [
            'Rc<T>',
            'Arc<T>',
            'RefCell<T>',
          ],
          correctIndex: 1,
          explanation:
            '`Arc<T>` uses atomic reference counting and implements `Send` and `Sync`, whereas `Rc<T>` is restricted to a single thread.',
          challengePrompt: 'Type the thread-safe atomic reference-counted smart pointer name:',
          challengePrefix: 'let shared = ',
          challengeKeyword: 'Arc',
          challengeSuffix: '::new(config);',
          challengeSuccess: 'Valid Rust syntax! `Arc<T>` enables thread-safe shared ownership.',
        },
      },
      ja: {
        title: 'スマートポインタ：Box, Rc, Arc, RefCell',
        shortTitle: '9. スマートポインタ',
        phase: 'フェーズ 3：実践マスター',
        difficulty: '上級',
        duration: '35 分',
        summary: 'Box<T> によるヒープ確保、Rc<T> の単一スレッド共有、Arc<T> によるスレッド安全な参照カウント、RefCell の内部可変性を学びます。',
        tags: ['スマートポインタ', 'Box', 'Arc', 'RefCell'],
        overview:
          '単一所有権では表現しづらい再帰構造やグラフ構造、複数スレッド間での状態共有にはスマートポインタを用います。`Deref` と `Drop` を実装した `Box`, `Rc`, `Arc`, `RefCell` が安全境界を守りながら柔軟な所有権を実現します。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              '目的に応じてスマートポインタを選択します：`Box<T>` は単独ヒープ所有、`Rc<T>` は単一スレッドの共有所有、`Arc<T>` はスレッド安全な原子カウント共有、`RefCell<T>` は実行時借用チェックによる内部可変性を提供します。',
            bullets: [
              '`Box<T>` は再帰型（`Cons(i32, Box<List>)`）やトレイトオブジェクトに不可欠です',
              '`Rc::clone(&ptr)` は実データを複製せず参照カウントを O(1) で +1 するだけです',
              '`Arc<T>` はアトミック演算により `Send + Sync` を満たしスレッド間で安全に共有できます',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '`RefCell<T>` は不変参照越しに中身を書き換える「内部可変性」を提供しますが、借用ルールに違反すると実行時にパニックします。また非スレッド安全な `Rc<T>` を別スレッドへ送るとコンパイル時に阻止されます。',
            bullets: [
              '`Rc<RefCell<T>>` を `thread::spawn` へ渡すと error[E0277]（`Send` 未実装）でコンパイルエラー',
              '循環参照によるメモリリークを防ぐには `Weak<T>`（弱参照）を活用します',
              'マルチスレッドの共有可変状態には `Arc<Mutex<T>>` の組み合わせを使います',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              '`borrow_mut()` が返すガードの寿命は極力短く保ち、読み取り専用データのスレッド間共有には `Mutex` なしの軽量な `Arc<T>` を使いましょう。',
            bullets: [
              'ブロックスコープや `drop(guard)` で借用ガードを早めに解放し実行時パニックを回避',
              '親から子へは `Rc`、子から親への逆参照には `Weak` を使って循環を断ち切ります',
              '本当に書き換えが必要な場合にのみ `Arc<T>` の内側を `Mutex<T>` で包みます',
            ],
          },
        ],
        codeSnippet: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    // Box<T>：単独所有権を持つヒープ割り当て
    let boxed_val = Box::new(42);
    println!("Box の値: {}", boxed_val);

    // Rc<RefCell<T>>：単一スレッド内で複数の所有者から共有データを変更
    let shared_log = Rc::new(RefCell::new(vec!["init".to_string()]));
    let observer_a = Rc::clone(&shared_log);
    let observer_b = Rc::clone(&shared_log);

    observer_a.borrow_mut().push("event_1".to_string());
    observer_b.borrow_mut().push("event_2".to_string());

    println!("所有者数: {}, ログ: {:?}", Rc::strong_count(&shared_log), shared_log.borrow());
}`,
        codeExplanation: [
          '6行目：Box::new(42) がヒープに値を確保し、スコープ終了時に自動解放されます。',
          '10-12行目：Rc::clone によりベクタを複製せず参照カウントを3に増やしています。',
          '14-15行目：borrow_mut() で一時的な可変借用を取得し、セミコロンで即座に解放します。',
          '17行目：両方の所有者からの変更が同じ共有ベクタに反映されます。',
        ],
        pitfall: {
          title: 'RefCell で同時に2つの可変借用を取得すると実行時パニックする',
          errorCode: 'thread \'main\' panicked at \'already borrowed: BorrowMutError\'',
          badCode: `use std::cell::RefCell;

let cell = RefCell::new(10);
let mut b1 = cell.borrow_mut();
let mut b2 = cell.borrow_mut(); // 実行時パニック！
*b1 += 1;
*b2 += 1;`,
          description:
            '`RefCell<T>` は借用ルールを無効化するわけではなく、検査をコンパイル時から実行時へ移します。最初の `RefMut` ガードが解放される前に再度 `borrow_mut()` を呼ぶと即座にパニックします。',
          fix: '`{ let mut b1 = cell.borrow_mut(); *b1 += 1; }` のようにブロックで寿命を区切るか、`drop(b1)` で明示解放してください。',
        },
        quiz: {
          question: '複数の OS スレッド間で読み取り専用の設定データを安全に共有したい場合、どのスマートポインタを選ぶべきですか？',
          options: [
            'Rc<T>',
            'Arc<T>',
            'RefCell<T>',
          ],
          correctIndex: 1,
          explanation:
            '`Arc<T>` はアトミック参照カウントを用いて `Send` と `Sync` を実装しているため、スレッド間で安全に共有できます。',
          challengePrompt: 'スレッド安全なアトミック参照カウントのスマートポインタ型名を入力してください：',
          challengePrefix: 'let shared = ',
          challengeKeyword: 'Arc',
          challengeSuffix: '::new(config);',
          challengeSuccess: '正解です！`Arc<T>` でスレッド安全な共有所有権を扱えます。',
        },
      },
    },
  },
  {
    slug: 'concurrency-mutex',
    order: 10,
    phaseKey: 'phase3',
    difficultyKey: 'advanced',
    iconKey: 'zap',
    visualizerSlug: 'concurrency',
    prevSlug: 'smart-pointers',
    translations: {
      zh: {
        title: '无畏并发与互斥锁',
        shortTitle: '10. 无畏并发与 Mutex',
        phase: '第三阶段：高阶精通',
        difficulty: '高级',
        duration: '40 分钟',
        summary: '使用 thread::spawn 创建并发线程，掌握 mpsc 消息通道、Arc<Mutex<T>> 锁保护以及 Send/Sync 线程安全标记 trait。',
        tags: ['多线程', 'Mutex', 'MPSC通道', '无畏并发'],
        overview:
          'Rust 的“无畏并发”（Fearless Concurrency）将所有权和类型检查延伸至多线程领域：数据竞争（Data Race）在编译期就被直接拦截。无论采用“通过通信共享内存”（MPSC 通道）还是“基于 Mutex 的共享状态同步”，编译器都为你守住最后一道防线。',
        sections: [
          {
            title: '核心概念与心智模型',
            content:
              '在 C/C++ 中忘记加锁只是悄无声息的未定义行为；而在 Rust 中，受保护数据直接封装在 `Mutex<T>` 内部，只有成功调用 `.lock()` 获取 `MutexGuard` 后才能访问里面的值，退出作用域时锁会自动释放（RAII）。',
            bullets: [
              '`std::thread::spawn(move || ...)` 通过 `move` 闭包安全转移环境变量所有权给子线程',
              '`mpsc`（多生产者单消费者通道）通过 `tx.send(msg)` 移交所有权，防止发送方继续误改数据',
              '`Arc<Mutex<T>>` 是跨线程可变共享状态的标准组合：原子计数 + 互斥锁防护',
            ],
          },
          {
            title: '编译器规则与内存机制',
            content:
              '编译器通过两个标记 trait（Marker Traits）验证并发安全：`Send` 表示所有权可安全跨线程转移，`Sync` 表示不可变引用 `&T` 可安全在多线程间共享读取。',
            bullets: [
              '未实现 `Send` 的类型（如 `Rc<T>`）试图跨越线程边界会立即报错 E0277',
              '互斥锁无法阻止“死锁”（如线程 A 等锁 2、线程 B 等锁 1），工程上需规定统一的加锁顺序',
              '若持锁线程意外 panic，锁进入“中毒（Poisoned）”状态，防止后续线程读取到半修改的脏数据',
            ],
          },
          {
            title: '工程实战与最佳实践',
            content:
              '保持锁粒度尽可能小：只在内存读写的几行代码内持有 `MutexGuard`，切勿跨越耗时 I/O 或通道阻塞等待时持锁。',
            bullets: [
              '调用 `handle.join()` 等待子线程完成并捕获可能发生的线程 panic',
              '优先使用消息传递（Channel）或无锁原子类型（`AtomicUsize`），减少锁竞争',
              '当必须同时获取多把锁时，严格遵循全局一致的加锁顺序以彻底杜绝死锁',
            ],
          },
        ],
        codeSnippet: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let (tx, rx) = mpsc::channel();

    let mut handles = vec![];
    for id in 0..3 {
        let counter_ref = Arc::clone(&counter);
        let tx_clone = tx.clone();

        handles.push(thread::spawn(move || {
            let mut num = counter_ref.lock().unwrap();
            *num += 1;
            tx_clone.send(format!("线程 {} 完成自增 -> {}", id, *num)).unwrap();
        })); // MutexGuard 在此处自动释放（RAII）
    }
    drop(tx); // 释放原始发送端以关闭通道

    for msg in rx { println!("{}", msg); }
    for h in handles { h.join().unwrap(); }
}`,
        codeExplanation: [
          '第 5-6 行：创建跨线程共享计数器 `Arc<Mutex<i32>>` 与 `mpsc` 异步消息通道。',
          '第 13 行：`move ||` 闭包夺取克隆后的句柄 `counter_ref` 与 `tx_clone` 所有权进入子线程。',
          '第 14-17 行：`lock()` 阻塞等待并获取 `MutexGuard`，在闭包末尾自动解锁防止忘写 unlock。',
          '第 19-22 行：关闭多余的发送端 `tx` 后主线程遍历接收所有消息并 `join` 汇总。',
        ],
        pitfall: {
          title: '持锁期间阻塞或互相按相反顺序加锁引发死锁',
          errorCode: 'Deadlock: Thread A holds Lock 1 waiting for Lock 2; Thread B holds Lock 2 waiting for Lock 1',
          badCode: `// 线程 A：先 lock(m1) 再 lock(m2)
// 线程 B：先 lock(m2) 再 lock(m1) -> 永久互锁阻塞！`,
          description:
            'Rust 类型系统能 100% 防止“数据竞争（Data Race）”，但逻辑层面的死锁（Deadlock）依然是合法的并发行为。忘记释放第一把锁就去请求另一把顺序相反的锁会导致永久挂起。',
          fix: '所有线程严格按照固定全局顺序（先 `m1` 后 `m2`）加锁，并在请求下一把锁前通过局部作用域或 `drop(guard)` 尽快释放已持有的锁。',
        },
        quiz: {
          question: '当一个线程对已被另一线程持有的 `Mutex` 调用 `.lock()` 时，会发生什么？',
          options: [
            '调用线程会阻塞并休眠等待，直到持有锁的线程离开作用域并 Drop 其 MutexGuard。',
            '调用线程会立即触发 panic 并崩溃退出。',
            '互斥锁会强行驱逐当前持有者并把锁转交给新线程。',
          ],
          correctIndex: 0,
          explanation:
            '`Mutex::lock()` 会阻塞当前线程直到前任持有者的 `MutexGuard` 被释放（Drop），从而保证同一时刻只有一个线程能读写受保护的数据。',
          challengePrompt: '填入用于获取 Mutex 互斥锁保护守卫的方法名：',
          challengePrefix: 'let mut guard = counter.',
          challengeKeyword: 'lock',
          challengeSuffix: '().unwrap();',
          challengeSuccess: '回答正确！`.lock()` 获取 `MutexGuard`，并在离开作用域时自动解锁。',
        },
      },
      en: {
        title: 'Fearless Concurrency & Mutex',
        shortTitle: '10. Fearless Concurrency',
        phase: 'Phase 3: Mastery',
        difficulty: 'Advanced',
        duration: '40 min',
        summary: 'Spawn OS threads, communicate over mpsc channels, synchronize shared state with Mutex<T>, and understand Send and Sync traits.',
        tags: ['Threads', 'Mutex', 'MPSC', 'Fearless Concurrency'],
        overview:
          'Rust’s fearless concurrency extends ownership and borrow checking across OS threads, making data races a compile-time error. Whether passing ownership across `mpsc` channels or guarding shared mutations with `Arc<Mutex<T>>`, the compiler guards every thread boundary.',
        sections: [
          {
            title: 'Core Concepts & Mental Model',
            content:
              'Unlike C/C++ mutexes that float separately from the data they guard, Rust’s `Mutex<T>` wraps the protected value inside its type. You can only read or mutate `T` via the `MutexGuard` returned by `.lock()`, which unlocks automatically on `drop()`.',
            bullets: [
              '`thread::spawn(move || ...)` moves captured values safely into the spawned thread',
              '`mpsc::channel()` transfers ownership from producers to consumers without shared mutation',
              '`Arc<Mutex<T>>` combines atomic reference counting with exclusive lock guards',
            ],
          },
          {
            title: 'Compiler Rules & Memory Mechanics',
            content:
              'Two auto marker traits govern concurrency: `Send` permits transferring ownership across threads, while `Sync` permits sharing immutable `&T` references safely across threads.',
            bullets: [
              'Non-Send types like `Rc<T>` fail to cross thread boundaries with error[E0277]',
              'Rust prevents data races statically, though lock-ordering deadlocks remain a logic hazard',
              'If a thread panics while holding a mutex, the lock becomes poisoned to alert subsequent callers',
            ],
          },
          {
            title: 'Engineering Best Practices',
            content:
              'Keep critical sections tiny—drop `MutexGuard` immediately after updating in-memory state and never hold locks across blocking I/O.',
            bullets: [
              'Always call `.join()` on `JoinHandle`s when background work must finish before shutdown',
              'Use `AtomicUsize` / `AtomicBool` for simple counters instead of a full `Mutex`',
              'Enforce a strict global lock acquisition order whenever multiple mutexes interact',
            ],
          },
        ],
        codeSnippet: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let (tx, rx) = mpsc::channel();

    let mut handles = vec![];
    for id in 0..3 {
        let counter_ref = Arc::clone(&counter);
        let tx_clone = tx.clone();

        handles.push(thread::spawn(move || {
            let mut num = counter_ref.lock().unwrap();
            *num += 1;
            tx_clone.send(format!("Thread {} incremented -> {}", id, *num)).unwrap();
        })); // MutexGuard automatically unlocks here (RAII)
    }
    drop(tx); // Close original sender so rx iteration terminates

    for msg in rx { println!("{}", msg); }
    for h in handles { h.join().unwrap(); }
}`,
        codeExplanation: [
          'Lines 5-6: Initializes an `Arc<Mutex<i32>>` counter and an `mpsc` producer/consumer channel.',
          'Line 13: The `move` closure transfers ownership of cloned handles into each OS thread.',
          'Lines 14-17: `.lock()` acquires exclusive access via `MutexGuard`, releasing automatically at `}`.',
          'Lines 19-22: Dropping the original `tx` ends the receiver loop cleanly after threads join.',
        ],
        pitfall: {
          title: 'Acquiring two locks in opposite order causing a deadlock',
          errorCode: 'Deadlock: Thread A holds Lock 1 waiting for Lock 2; Thread B holds Lock 2 waiting for Lock 1',
          badCode: `// Thread A: lock(m1) then lock(m2)
// Thread B: lock(m2) then lock(m1) -> mutual deadlock!`,
          description:
            'While Rust eliminates data races at compile time, safe Rust can still deadlock if two threads hold one lock each and block forever waiting on the other.',
          fix: 'Enforce a consistent global lock order across all threads (always lock `m1` before `m2`) and drop guards promptly before acquiring subsequent locks.',
        },
        quiz: {
          question: 'What happens when a thread calls lock() on a Mutex that is currently held by another thread?',
          options: [
            'The thread blocks and sleeps until the holding thread drops its MutexGuard.',
            'The calling thread panics immediately.',
            'The mutex forcibly evicts the holding thread and grants access.',
          ],
          correctIndex: 0,
          explanation:
            'Mutex::lock() blocks the calling thread until the mutex is released when the previous owner drops its MutexGuard.',
          challengePrompt: 'Type the Mutex method called to acquire an exclusive MutexGuard:',
          challengePrefix: 'let mut guard = counter.',
          challengeKeyword: 'lock',
          challengeSuffix: '().unwrap();',
          challengeSuccess: 'Valid Rust syntax! `.lock()` blocks until the MutexGuard is acquired.',
        },
      },
      ja: {
        title: '恐れなき並行性と Mutex',
        shortTitle: '10. 恐れなき並行性',
        phase: 'フェーズ 3：実践マスター',
        difficulty: '上級',
        duration: '40 分',
        summary: 'OS スレッドの生成、mpsc チャネル通信、Arc<Mutex<T>> による排他制御、Send と Sync トレイトの役割を習得します。',
        tags: ['スレッド', 'Mutex', 'MPSC', '並行処理'],
        overview:
          'Rust の「恐れなき並行性（Fearless Concurrency）」は、所有権と借用チェックをマルチスレッドへ拡張し、データ競合をコンパイル時に根絶します。`mpsc` チャネルによるメッセージパッシングと `Arc<Mutex<T>>` による同期制御の両方を安全に記述できます。',
        sections: [
          {
            title: '核心コンセプトとメンタルモデル',
            content:
              'C/C++ のミューテックスと異なり、Rust の `Mutex<T>` は保護対象のデータそのものを内部に包み込みます。`.lock()` で `MutexGuard` を取得しない限り中身にアクセスできず、スコープを抜けると自動的にアンロックされます（RAII）。',
            bullets: [
              '`thread::spawn(move || ...)` で変数の所有権を安全に別スレッドへ移動',
              '`mpsc::channel()` は `tx.send()` で所有権を渡し、送信後の誤操作を防止',
              '`Arc<Mutex<T>>` はスレッド安全な共有所有権と排他ロックの黄金ペアです',
            ],
          },
          {
            title: 'コンパイラルールとメモリ機構',
            content:
              '並行安全性を担保するのが 2 つのマーカートレイトです。`Send` はスレッド間での所有権移動が可能であることを、`Sync` は複数スレッドから `&T` を安全に共有参照できることを表します。',
            bullets: [
              '`Rc<T>` など `Send` を実装しない型を別スレッドへ送ると error[E0277] で拒否されます',
              'データ競合は完全に防げますが、ロック取得順の逆転によるデッドロックには注意が必要です',
              'ロック保持中にスレッドがパニックすると、ミューテックスは「毒状態（Poisoned）」になります',
            ],
          },
          {
            title: '実践ベストプラクティス',
            content:
              'ロックを保持するクリティカルセクションは最小限に抑え、I/O 待機や重い処理の前に必ず `MutexGuard` を解放しましょう。',
            bullets: [
              '生成したスレッドの完了を待つには `JoinHandle::join()` を呼び出します',
              '単純な数値カウンタにはロック不要の `AtomicUsize` の利用も検討しましょう',
              '複数のロックを同時に扱う際は、常に全スレッドで同じ取得順序を徹底します',
            ],
          },
        ],
        codeSnippet: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let (tx, rx) = mpsc::channel();

    let mut handles = vec![];
    for id in 0..3 {
        let counter_ref = Arc::clone(&counter);
        let tx_clone = tx.clone();

        handles.push(thread::spawn(move || {
            let mut num = counter_ref.lock().unwrap();
            *num += 1;
            tx_clone.send(format!("スレッド {} 加算完了 -> {}", id, *num)).unwrap();
        })); // ここで MutexGuard が自動解放される (RAII)
    }
    drop(tx); // 元の送信端を閉じて受信ループを終了させる

    for msg in rx { println!("{}", msg); }
    for h in handles { h.join().unwrap(); }
}`,
        codeExplanation: [
          '5-6行目：スレッド間共有カウンタ `Arc<Mutex<i32>>` と `mpsc` チャネルを作成します。',
          '13行目：`move` クロージャによって複製したハンドルを各スレッドへムーブします。',
          '14-17行目：`.lock()` で排他権を取得し、インクリメント後にスコープ末尾で自動解放します。',
          '19-22行目：送信側を閉じた上で全メッセージを受信し、`join()` で終了を待ち合わせます。',
        ],
        pitfall: {
          title: '複数のロックを逆順で取得してデッドロックを起こす',
          errorCode: 'Deadlock: Thread A holds Lock 1 waiting for Lock 2; Thread B holds Lock 2 waiting for Lock 1',
          badCode: `// スレッド A: lock(m1) -> lock(m2)
// スレッド B: lock(m2) -> lock(m1) -> 互いに待ち続けて永久停止！`,
          description:
            'Rust はデータ競合をコンパイル時に防ぎますが、異なるスレッドが逆順で複数のロックを取り合うデッドロックは安全な Rust コード内でも発生し得ます。',
          fix: 'すべてのスレッドで必ず同じ順序（常に `m1` の次に `m2`）でロックを取得し、次のロックを待つ前に古いガードを `drop` してください。',
        },
        quiz: {
          question: '別のスレッドがすでに保持している `Mutex` に対して `.lock()` を呼び出すとどうなりますか？',
          options: [
            '保持中のスレッドが `MutexGuard` を破棄（Drop）して解放するまで、呼び出し元スレッドがブロックして待機する。',
            '呼び出し元スレッドが即座にパニックして終了する。',
            '保持中のスレッドからロックを強制剥奪してアクセス権を奪う。',
          ],
          correctIndex: 0,
          explanation:
            '`Mutex::lock()` は現在の所有者が `MutexGuard` を解放するまで待機し、同時に1つのスレッドだけがデータへアクセスできるようにします。',
          challengePrompt: 'Mutex の排他ロックガードを取得するメソッド名を入力してください：',
          challengePrefix: 'let mut guard = counter.',
          challengeKeyword: 'lock',
          challengeSuffix: '().unwrap();',
          challengeSuccess: '正解です！`.lock()` で `MutexGuard` を取得し、スコープ終了時に自動解放されます。',
        },
      },
    },
  },
];
