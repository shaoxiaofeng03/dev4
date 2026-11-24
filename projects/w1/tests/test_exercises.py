"""W1 练习的验收测试。

这些测试是规格：实现 TODO 后应全部通过。不要为了让测试变绿而修改测试。
运行：
    uv run pytest -q
"""

from __future__ import annotations

from dataclasses import FrozenInstanceError
from pathlib import Path

import pytest

from w1.exercises import (
    NonPositiveIntError,
    Student,
    filter_even,
    indexed_items,
    list_files,
    parse_positive_int,
    read_non_empty_lines,
    safe_parse_positive_int,
    sort_dict_by_value,
    summarize_scores,
    write_and_read_text,
    zip_pairs,
)


def test_filter_even_keeps_order_and_negative_numbers() -> None:
    assert filter_even([1, 2, 3, 4, -2, 0]) == [2, 4, -2, 0]
    assert filter_even([]) == []
    assert filter_even([1, 3, 5]) == []


def test_sort_dict_by_value_default_and_reverse() -> None:
    data = {"b": 2, "a": 2, "c": 1}
    assert sort_dict_by_value(data) == [("c", 1), ("a", 2), ("b", 2)]
    assert sort_dict_by_value(data, reverse=True) == [("b", 2), ("a", 2), ("c", 1)]
    assert sort_dict_by_value({}) == []
    # 不修改入参
    assert data == {"b": 2, "a": 2, "c": 1}


def test_write_and_read_text_round_trip(tmp_path: Path) -> None:
    path = tmp_path / "note.txt"
    assert write_and_read_text(path, "你好\nworld") == "你好\nworld"
    assert path.read_text(encoding="utf-8") == "你好\nworld"

    # 第二次写入应覆盖旧内容
    assert write_and_read_text(path, "new content") == "new content"


def test_read_non_empty_lines_strips_and_skips_blank(tmp_path: Path) -> None:
    path = tmp_path / "lines.txt"
    path.write_text("  first  \n\n second\n   \nthird\n", encoding="utf-8")
    assert read_non_empty_lines(path) == ["first", "second", "third"]


def test_read_non_empty_lines_empty_file(tmp_path: Path) -> None:
    path = tmp_path / "empty.txt"
    path.write_text("", encoding="utf-8")
    assert read_non_empty_lines(path) == []


def test_parse_positive_int_success_and_errors() -> None:
    assert parse_positive_int("42") == 42

    for bad in ["0", "-1", "abc", "", "3.14"]:
        with pytest.raises(NonPositiveIntError):
            parse_positive_int(bad)


def test_safe_parse_positive_int_catches_custom_error() -> None:
    assert safe_parse_positive_int("7") == 7
    assert safe_parse_positive_int("0") is None
    assert safe_parse_positive_int("-3") is None
    assert safe_parse_positive_int("abc") is None


def test_student_dataclass_and_passing_rule() -> None:
    alice = Student("Alice", 90)
    bob = Student("Bob", 59)

    assert alice.is_passing() is True
    assert bob.is_passing() is False
    assert Student("Alice", 90) == alice
    assert Student("Alice", 90) != bob


def test_student_is_frozen() -> None:
    student = Student("Alice", 90)
    with pytest.raises(FrozenInstanceError):
        # 故意绕过静态检查，验证运行时会拒绝修改 frozen dataclass。
        setattr(student, "score", 100)  # noqa: B010


def test_list_files_recursive_sorted_and_files_only(tmp_path: Path) -> None:
    sub = tmp_path / "sub"
    sub.mkdir()
    a_py = tmp_path / "a.py"
    b_txt = tmp_path / "b.txt"
    c_py = sub / "c.py"
    dir_named_py = sub / "dir.py"
    dir_named_py.mkdir()

    for path in (a_py, b_txt, c_py):
        path.write_text("", encoding="utf-8")

    expected = sorted([a_py, c_py], key=str)
    assert list_files(tmp_path) == expected
    assert list_files(tmp_path, ".txt") == [b_txt]


def test_indexed_items_uses_one_based_index() -> None:
    assert indexed_items(["apple", "banana"]) == ["1. apple", "2. banana"]
    assert indexed_items([]) == []


def test_zip_pairs_stops_at_shorter_input() -> None:
    assert zip_pairs([1, 2, 3], [10, 20]) == [(1, 10), (2, 20)]
    assert zip_pairs([], [1, 2]) == []
    assert zip_pairs([1], []) == []


def test_summarize_scores_normal_and_empty() -> None:
    assert summarize_scores("Alice", [80, 90, 100]) == {
        "name": "Alice",
        "count": 3,
        "average": 90.0,
    }
    assert summarize_scores("Bob", []) == {
        "name": "Bob",
        "count": 0,
        "average": 0.0,
    }
