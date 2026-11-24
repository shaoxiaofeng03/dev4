"""W1 Python 热身练习。

规则：
1. 只补全函数/类里的 TODO，不要改函数签名和测试。
2. 每个 TODO 上方都写了验收要求。
3. 实现后运行：
       uv run pytest
       uv run mypy src tests
       uv run ruff check .
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path


class NonPositiveIntError(ValueError):
    """练习 5 的自定义异常：文本不是整数，或整数 <= 0 时抛出。"""


def filter_even(numbers: list[int]) -> list[int]:
    """练习 1：用列表推导式返回所有偶数，保持原顺序。

    要求：
    - 必须使用列表推导式，不要写 for + append。
    - 0 和负数按奇偶判断（0 是偶数，-2 是偶数）。
    - 不修改入参。
    """
    return [x for x in numbers if x % 2 == 0]


def sort_dict_by_value(
    data: dict[str, int],
    reverse: bool = False,
) -> list[tuple[str, int]]:
    """练习 2：按 value 排序，返回 (key, value) 列表。

    要求：
    - 默认：value 升序；value 相同时按 key 升序。
    - reverse=True：value 降序；value 相同时按 key 降序。
    - 不修改入参。
    """
    return sorted(data.items(), key=lambda kv: (kv[1], kv[0]), reverse=reverse)


data = {"one": 1, "three": 3, "two": 2, "aaa": 3}


def write_and_read_text(path: Path, text: str) -> str:
    """练习 3：读写一个文本文件，返回读回的内容。

    要求：
    - 使用 UTF-8 编码。
    - 先写入 path（覆盖原内容），再读回并返回。
    - 不负责创建父目录；测试会传入已存在的目录。
    """
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

    # 另一种写法：按行读取后再拼接（保留每行自带的换行符）
    # with open(path, "w", encoding="utf-8") as f:
    #     f.write(text)
    # with open(path, "r", encoding="utf-8") as f:
    #     lines = f.readlines()
    # return "".join(lines)


def read_non_empty_lines(path: Path) -> list[str]:
    """练习 4：用 with 打开文件，返回非空行。

    要求：
    - 必须使用 with path.open(...) as f 的形式。
    - 去掉每行首尾空白（包括换行符）。
    - 跳过去掉空白后为空的行。
    - 保持原顺序。
    """
    with path.open("r", encoding="utf-8") as f:
        return [stripped for line in f if (stripped := line.strip())]


def parse_positive_int(text: str) -> int:
    """练习 5：把文本解析成正整数。

    要求：
    - 能转成 int 且 > 0 时返回该整数。
    - 以下情况都抛出 NonPositiveIntError：
      * 不是整数（例如 "abc"、""）；
      * 整数 <= 0（例如 "0"、"-1"）。
    - 不要把底层 ValueError 直接漏出去。
    """
    try:
        value = int(text)
    except ValueError as exc:
        raise NonPositiveIntError(f"不是整数: {text!r}") from exc
    if value <= 0:
        raise NonPositiveIntError(f"必须是正整数: {value}")
    return value


def safe_parse_positive_int(text: str) -> int | None:
    """练习 5（续）：捕获自定义异常，失败时返回 None。

    要求：
    - 调用 parse_positive_int。
    - 捕获 NonPositiveIntError，返回 None。
    - 不要捕获其他异常类型。
    """
    try:
        return parse_positive_int(text)
    except NonPositiveIntError:
        return None


@dataclass(frozen=True)
class Student:
    """练习 6：确认这是一个 frozen dataclass，并补全 is_passing()。

    要求：
    - 字段为 name: str、score: int。
    - is_passing()：score >= 60 返回 True，否则 False。
    """

    name: str
    score: int

    def is_passing(self) -> bool:
        return self.score >= 60


def list_files(root: Path, suffix: str = ".py") -> list[Path]:
    """练习 7：用 pathlib 递归遍历目录，返回指定后缀的文件。

    要求：
    - 递归遍历 root。
    - 只返回文件，不返回目录（即使目录名以 suffix 结尾）。
    - 按 str(path) 排序，保证结果稳定。
    - suffix 区分大小写。
    """
    return sorted(
        (p for p in root.rglob("*") if p.is_file() and p.suffix == suffix),
        key=str,
    )


def indexed_items(items: Sequence[str]) -> list[str]:
    """练习 8：用 enumerate 生成带序号的行。

    要求：
    - 返回形如 "1. apple" 的字符串列表。
    - 序号从 1 开始，不是 0。
    - 空输入返回空列表。
    """
    return [f"{index}. {item}" for index, item in enumerate(items, start=1)]


def zip_pairs(left: Sequence[int], right: Sequence[int]) -> list[tuple[int, int]]:
    """练习 9：用 zip 合并两个序列。

    要求：
    - 返回 (left[i], right[i]) 的列表。
    - 长度不等时以短的一边为准。
    - 空输入返回空列表。
    """
    return list(zip(left, right))


def summarize_scores(name: str, scores: Sequence[int]) -> dict[str, str | int | float]:
    """练习 10：带完整类型注解的函数，并用 mypy 验证。

    要求：
    - 返回字典，包含：
      * "name": 原样返回 name；
      * "count": scores 的长度（int）；
      * "average": 平均分（float）；空列表时为 0.0。
    - 不要修改 scores。
    - 运行 uv run mypy src tests，确保没有类型错误。
    """
    count = len(scores)
    average = sum(scores) / count if count else 0.0
    return {"name": name, "count": count, "average": average}
