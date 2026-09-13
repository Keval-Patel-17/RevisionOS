import pytest
from backend.app.services.metadata_filter import metadata_filter

def test_metadata_line_detection():
    # Administrative lines that MUST be detected as metadata
    bad_lines = [
        "1",
        "19",
        "Slide 1",
        "Slide 19",
        "Page 4",
        "12 / 45",
        "[14]",
        "Prof. Soumya K Ghosh",
        "Professor Soumya K Ghosh",
        "Dr. B. K. Patel",
        "Department of Computer Science and Engineering",
        "Indian Institute of Technology Kharagpur",
        "IIT Kharagpur",
        "skg@cse.iitkgp.ac.in",
        "https://cse.iitkgp.ac.in",
        "Copyright 2024 All Rights Reserved",
        "September 2026",
        "Course Code: CS31005",
        "Lecture 4",
        "12-09-2024",
    ]

    for line in bad_lines:
        assert metadata_filter.is_metadata_line(line) is True, f"Failed to detect metadata: {line}"

def test_academic_preservation():
    # Genuine academic concepts/formulas that MUST NOT be flagged as metadata
    academic_lines = [
        "CPU-I/O Burst Cycle & Process Distribution",
        "Round Robin (RR) Scheduling & Quantum Dynamics",
        "O(n^2) runtime complexity",
        "q = 8ms time slice",
        "80% of CPU bursts are shorter than q",
        "tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n",
        "Turnaround Time = Completion - Arrival",
        "Starvation solved by Dynamic Aging",
        "Multilevel Feedback Queue Architecture",
        "Shortest-Job-First Optimality Proof",
    ]

    for line in academic_lines:
        assert metadata_filter.is_metadata_line(line) is False, f"Erroneously flagged academic line: {line}"

def test_clean_academic_title():
    # Bad candidate titles must be cleaned or replaced
    assert metadata_filter.clean_academic_title("1") == "Academic Concepts"
    assert metadata_filter.clean_academic_title("19") == "Academic Concepts"
    assert metadata_filter.clean_academic_title("Prof. Soumya K Ghosh") == "Academic Concepts"
    assert metadata_filter.clean_academic_title("Department of Computer Science") == "Academic Concepts"
    
    # Slide / chapter markers must be stripped
    assert metadata_filter.clean_academic_title("Lecture 4: CPU Scheduling") == "CPU Scheduling"
    assert metadata_filter.clean_academic_title("Chapter 5 - Process Synchronization") == "Process Synchronization"
    assert metadata_filter.clean_academic_title("Mobile Cloud Computing - I") == "Mobile Cloud Computing"
    assert metadata_filter.clean_academic_title("Cloud Offloading (Contd.)") == "Cloud Offloading"
    
    # Valid titles must be preserved
    assert metadata_filter.clean_academic_title("Shortest-Job-First (SJF) Optimality") == "Shortest-Job-First (SJF) Optimality"
